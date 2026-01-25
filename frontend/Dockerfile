FROM node:24 as node

WORKDIR /app

COPY . .

WORKDIR /app/js

RUN npm install
RUN npm run build

WORKDIR /app/css

RUN npm install
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:9.0 as build

COPY --from=node /app/ /build/

WORKDIR /build

RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0
COPY --from=build /app/publish /app

WORKDIR /app

ENTRYPOINT ["./BaseWeb"]
