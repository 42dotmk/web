using System.Text.Json.Nodes;
using Microsoft.Extensions.Caching.Memory;

namespace BaseWeb;

public sealed record DiscordSummary(
    int? OnlineCount,
    int? MemberCount,
    IReadOnlyList<string> AvatarUrls)
{
    public static readonly DiscordSummary Unavailable = new(null, null, []);
}

public sealed class DiscordService(
    IHttpClientFactory httpClientFactory,
    IMemoryCache cache,
    ILogger<DiscordService> logger)
{
    private const string CacheKey = "discord-summary";
    private static readonly TimeSpan SuccessCacheDuration = TimeSpan.FromMinutes(5);
    private static readonly TimeSpan FailureCacheDuration = TimeSpan.FromMinutes(1);
    private readonly SemaphoreSlim refreshLock = new(1, 1);
    private DiscordSummary? lastKnownSummary;

    public async Task<DiscordSummary> GetSummaryAsync(CancellationToken cancellationToken = default)
    {
        if (cache.TryGetValue(CacheKey, out DiscordSummary? cachedSummary) && cachedSummary is not null)
        {
            return cachedSummary;
        }

        await refreshLock.WaitAsync(cancellationToken);
        try
        {
            if (cache.TryGetValue(CacheKey, out cachedSummary) && cachedSummary is not null)
            {
                return cachedSummary;
            }

            var http = httpClientFactory.CreateClient("Discord");
            var widgetTask = http.GetFromJsonAsync<JsonObject>(
                Constants.DiscordWidgetUrl,
                cancellationToken);
            var inviteTask = http.GetFromJsonAsync<JsonObject>(
                Constants.DiscordMembersUrl,
                cancellationToken);

            await Task.WhenAll(widgetTask, inviteTask);

            var widget = await widgetTask;
            var invite = await inviteTask;
            var summary = ParseSummary(widget, invite);

            lastKnownSummary = summary;
            cache.Set(CacheKey, summary, SuccessCacheDuration);
            return summary;
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            var fallback = lastKnownSummary ?? DiscordSummary.Unavailable;
            cache.Set(CacheKey, fallback, FailureCacheDuration);
            logger.LogWarning(ex, "Unable to refresh Discord data; using cached fallback");
            return fallback;
        }
        finally
        {
            refreshLock.Release();
        }
    }

    private static DiscordSummary ParseSummary(JsonObject? widget, JsonObject? invite)
    {
        var onlineCount = widget?["presence_count"]?.GetValue<int>();
        var memberCount = invite?["profile"]?["member_count"]?.GetValue<int>();
        var avatarUrls = widget?["members"]?.AsArray()
            .Select(member => member?["avatar_url"]?.GetValue<string>())
            .Where(url => !string.IsNullOrWhiteSpace(url))
            .Cast<string>()
            .ToArray() ?? [];

        return new DiscordSummary(onlineCount, memberCount, avatarUrls);
    }
}
