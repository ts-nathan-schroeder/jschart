import './App.css';
import { getChartContext, ChartModel, ChartConfig, ColumnType, CustomChartContext, Query, ChartToTSEvent } from '@thoughtspot/ts-chart-sdk';
import React from 'react';
import _ from 'lodash';
import * as THREE from 'three';
import { useEffect } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

(async () => {
    const ctx = await getChartContext({
        getDefaultChartConfig: (chartModel: ChartModel): ChartConfig[] => {
            const cols = chartModel.columns;
            const measureColumns = _.filter(cols, (col) => col.type === ColumnType.MEASURE);

            const attributeColumns = _.filter(cols, (col) => col.type === ColumnType.ATTRIBUTE);

            const axisConfig: ChartConfig = {
                key: 'default',
                dimensions: [
                    {
                        key: 'x',
                        columns: [attributeColumns[0]],
                    },
                    {
                        key: 'y',
                        columns: measureColumns.slice(0, 2),
                    },
                ],
            };
            return [axisConfig];
        },
        getQueriesFromChartConfig: (
            chartConfig: ChartConfig[],
        ): Array<Query> => chartConfig.map((config: ChartConfig): Query => _.reduce(
            config.dimensions,
            (acc: Query, dimension) => ({
                queryColumns: [...acc.queryColumns, ...dimension.columns],
            }),
            {
                queryColumns: [],
            } as Query,
        )),
        renderChart: (ctx) => renderChart(ctx),
    });

    renderChart(ctx);
})();

function App() {
  useEffect(()=>{
    renderChart(null);
  },[])
  return (
    <div className="App" style={{height:'100%',width:'100%'}} id="canvas">
    </div>
  );
}

export default App;
function renderChart(ctx: CustomChartContext): Promise<void> {
  console.log("context",ctx);
  let scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdddddd);
  var camera = new THREE.PerspectiveCamera( 75, 600 / 600, 0.1, 1000 );   
  //camera.rotation.y = 45/180*Math.PI;
  camera.position.z = 3;
  let renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(600,600);
  
  document.getElementById('canvas').appendChild(renderer.domElement);
  
  let hlight = new THREE.AmbientLight (0x404040,100);
  scene.add(hlight);
  let directionalLight = new THREE.DirectionalLight(0xffffff,100);
  directionalLight.position.set(0,1,0);
  directionalLight.castShadow = true;
  let light = new THREE.PointLight(0xc4c4c4,2);
  light.position.set(-500,300,500);
  scene.add(light);
  
  var geometry = new THREE.BoxGeometry();
  var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

  var controls=null;
  

  var loader = new GLTFLoader();
  let targetList = []
  loader.load('basic_person.glb', function(gltf){
      /* 
          Model is loaded. Iterate through components and color by the count of Athletes. 
          We will add any relevant items to the targetList which will be used when listening for clicks.
      */
      // for (var j=0;j<gltf.scene.children.length;j++){
      //     var element = gltf.scene.children[j]
      //     var name = element.name.replace("_"," ")
      //     if (Object.keys(body_parts).includes(name)){
      //         //Pop body part out a bit
      //         element.position.z  = .2
              
      //         //Set the materials Red value, based on the count of athletes
      //         value = body_parts[name]/100*5
      //         element.material.color.r=value
              
      //         //Add the body part to the list of click targets
      //         targetList.push(element)
      //     }
      //     if (element.name =='body'){
      //         element.material.color.b=1
      //         targetList.push(element)
      //     }
      // }


      scene.add(gltf.scene);
      camera.position.z= 15
      camera.position.x= -5
      camera.position.y= 5
      camera.lookAt (new THREE.Vector3(0,0,0));
      controls = new OrbitControls( camera, renderer.domElement );
      controls.update();
      //scene.add( cube );
      renderer.render( scene, camera );
      animate();
  });


  function animate() {
    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );
  }
  
  var raycaster = new THREE.Raycaster(); // create once
  var mouse = new THREE.Vector2();
  
  renderer.render( scene, camera );
  
  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  /*
      On click function
  */
  function onDocumentMouseDown( event ) 
  {
      /*
          Find which object the user may have clicked on, leveraging the targetList created above.
      */
    var container=document.getElementById('canvas');
    var rect = container.getBoundingClientRect();
      mouse.x = ( ( event.clientX - rect.x ) / container.clientWidth ) * 2 - 1;
      mouse.y = - ( ( event.clientY - rect.y ) / container.clientHeight ) * 2 + 1;   
      raycaster.setFromCamera( mouse, camera );
      var intersects = raycaster.intersectObjects( targetList);

      /* 
          If they clicked on a body part, try to send the filter to the dashboard.
          We will create a function called setBodyPartFilter on the dashboard.                    
      */
    if ( intersects.length > 0 )
    {
        // Map reference code values back to 
      var part_map = {
          'Left_Quad':'Clavicle',
          'Left_Bicep':'Carpus'
      }
      // filter = intersects[0].object.name
      // try{
      //     window.setBodyPartFilter(part_map[filter]);
      // }catch (err){
      //     console.error(err)
      // }
    }

    ctx.emitEvent(ChartToTSEvent.RenderComplete, null);
  
  
  }
  return;
}

