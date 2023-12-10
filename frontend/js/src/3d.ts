import { AbstractMesh, ArcRotateCamera, Color4, CubeTexture, DirectionalLight, Nullable, Scene, SceneLoader, Vector3 } from '@babylonjs/core';
import { Engine } from '@babylonjs/core/Engines/engine'
import "@babylonjs/loaders/glTF";

export const runRenderLoop = async () => {
  return new Promise<void>((resolve) => {

    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const hero = document.getElementById("hero") as HTMLElement;
    let pointerX = 0;
    // let pointerY = 0;


    hero.addEventListener("mousemove", (e) => {
      pointerX = e.offsetX;
      // pointerY = e.offsetY;
    });

    if (canvas && hero) {
      const engine = new Engine(canvas, true);
      
      window.addEventListener('resize', function(){ engine.resize(); });

      const scene = new Scene(engine);
      scene.clearColor = new Color4(0, 0, 0, 0);

      scene.environmentTexture = new CubeTexture("https://assets.babylonjs.com/textures/Studio_Softbox_2Umbrellas_cube_specular.env" , scene);
      scene.environmentTexture.level = 0.3;
      let mesh: Nullable<AbstractMesh> = null;

      SceneLoader.ImportMeshAsync("Armature", "http://localhost:5245/", "VonnBots_3.0.glb", scene).then(() => {
        mesh = scene.getMeshByName("__root__");
        resolve();
      });
    
      new ArcRotateCamera("cam", 3.14/2, 3.14/2, 2, new Vector3(0, 90, 1), scene);
    
      var light2 = new DirectionalLight("light1", new Vector3(-1, -1, -1), scene);
      light2.intensity = .8;
    
      engine.runRenderLoop(() => {
        if (mesh) {
          const pickResult = scene.pick(pointerX, engine.getRenderHeight()-30);
          if (pickResult && pickResult.ray) {
            const dir = pickResult.ray.direction;
            const origin = pickResult.ray.origin;
            const nextPos: Vector3 =  origin.add(dir.multiplyByFloats(3, 3, 3));
            mesh.position = Vector3.Lerp(mesh.position, nextPos, 0.01);
          }
        }

        scene.render();
      });
    }
  });
};

