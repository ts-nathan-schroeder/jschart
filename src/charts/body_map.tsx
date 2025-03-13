import { getChartContext, ChartModel, ChartConfig, ColumnType, CustomChartContext, Query, ChartToTSEvent, DataType, VisualProps, ValidationResponse } from '@thoughtspot/ts-chart-sdk';
import React, { useRef } from 'react';
import _ from 'lodash';
import * as THREE from 'three';
import { useEffect } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


function BodyMap() {
  const ref = useRef(null)
  useEffect(()=>{
    initializeChart();
  },[])
  async function initializeChart(){
    console.log("initting chart")
    const ctx = await getChartContext({
      getDefaultChartConfig: (chartModel: ChartModel): ChartConfig[] => {
          console.log("defining config", chartModel)
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
      validateConfig: (
        updatedConfig: any[],
        chartModel: any,
      ): ValidationResponse => {
          console.log("validating config")
          if (updatedConfig.length <= 0) {
              return {
                  isValid: false,
                  validationErrorMessage: ['Invalid config. no config found'],
              };
          } else {
              return {
                  isValid: true,
              };
          }
      },
      getQueriesFromChartConfig: (
        chartConfig: ChartConfig[],
      ): Array<Query> => {
        console.log("getting queries")
          const queries = chartConfig.map(
              (config: ChartConfig): Query =>
                  _.reduce(
                      config.dimensions,
                      (acc: Query, dimension) => ({
                          queryColumns: [
                              ...acc.queryColumns,
                              ...dimension.columns,
                          ],
                      }),
                      {
                          queryColumns: [],
                      } as Query,
                  ),
          );
          return queries;
      },
      renderChart: (ctx) => renderChart(ctx),
      chartConfigEditorDefinition: [
        {
            key: 'column',
            label: 'Custom Column',
            descriptionText:
                'X Axis can only have attributes, Y Axis can only have measures, Color can only have attributes. ' +
                'Should have just 1 column in Y axis with colors columns.',
            columnSections: [
                {
                    key: 'x',
                    label: 'Custom X Axis',
                    allowAttributeColumns: true,
                    allowMeasureColumns: false,
                    allowTimeSeriesColumns: true,
                    maxColumnCount: 1,
                },
                {
                    key: 'y',
                    label: 'Custom Y Axis',
                    allowAttributeColumns: false,
                    allowMeasureColumns: true,
                    allowTimeSeriesColumns: false,
                },
            ],
        },

    ],
    visualPropEditorDefinition: {
      elements: [
          {
              key: 'color',
              type: 'radio',
              defaultValue: 'red',
              values: ['red', 'green', 'blue'],
              label: 'Colors',
          },
          {
              type: 'section',
              key: 'accordion',
              label: 'Accordion',
              children: [
                  {
                      key: 'Color2',
                      type: 'radio',
                      defaultValue: 'blue',
                      values: ['blue', 'white', 'red'],
                      label: 'Color2',
                  },
                  {
                      key: 'datalabels',
                      type: 'toggle',
                      defaultValue: false,
                      label: 'Data Labels',
                  },
              ],
          },
      ],
  },
  });
  console.log("initation finished")
  renderChart(ctx);
  }
  function renderChart(ctx: CustomChartContext): Promise<void> {
    setTimeout(()=>chartRender(ctx), 1000)
    return;
  }
  
  function chartRender(ctx: CustomChartContext){
    console.log("rendering",ctx);
    ref.current.innerHTML = "";
    if (ctx.getChartModel().data == null || ctx.getChartModel().data[0] == null ){
      return;
    }
    const width = document.body.scrollWidth;
    const height = document.body.scrollHeight;
    let scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);
    var camera = new THREE.PerspectiveCamera( 75, width / 800, 0.1, 1000 );   
    //camera.rotation.y = 45/180*Math.PI;
    camera.position.z = 3;
    let renderer = new THREE.WebGLRenderer({antialias:true});

    const canvas = renderer.domElement;
    // look up the size the canvas is being displayed

    console.log(width,height,"jhere",document.body);

    renderer.setSize(width,800);
    
    ref.current.appendChild(canvas);
    
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
    let context: any = ctx.getChartModel();
    console.log("contexto",context, context.visualProps);
    
    let data:any = context.data[0].data;
    let part_weight = {}
    for (var i=0;i<data.dataValue.length;i++){
      part_weight[data.dataValue[i][0]] = data.dataValue[i][1]
    }
    let color = "red";
    console.log(context.visualProps)
    if (context.visualProps){
      color = context.visualProps.color;
    }
    console.log(color, color=='green')
    loader.load('basic_person.glb', function(gltf){
        /* 
            Model is loaded. Iterate through components and color by the count of Athletes. 
            We will add any relevant items to the targetList which will be used when listening for clicks.
        */
       console.log(gltf,"gltf");
        for (var j=0;j<gltf.scene.children.length;j++){
            var element = gltf.scene.children[j];
            var name = element.name;
            console.log(name,part_weight)
            if (Object.keys(part_weight).includes(name)){
                //Pop body part out a bit
                element.position.z  = .2
                
                //Set the materials Red value, based on the count of athletes
                let value = part_weight[name]/5
                element.material.color.r = 0;
                element.material.color.g = 0;
                element.material.color.b = 0;

                if (color == 'red'){
                  element.material.color.r = value
                }
                if (color == 'green'){
                  element.material.color.g = value
                }
                if (color == 'blue'){
                  element.material.color.b = value
                }
  
                //Add the body part to the list of click targets
                targetList.push(element)
            }
            if (element.name =='body'){
                element.material.color.b=1
                targetList.push(element)
            }
        }
  
  
        scene.add(gltf.scene);
        camera.position.z= 15
        camera.position.x= -5
        camera.position.y= 5
        camera.lookAt (new THREE.Vector3(0,0,0));
        controls = new OrbitControls( camera, renderer.domElement );
        controls.update();
        //scene.add( cube );git
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
    ctx.emitEvent(ChartToTSEvent.RenderComplete);


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
      }
    
    
    }
    return;
  }  
  
  
  return (
    <div ref={ref} className="App" style={{height:'100%',width:'100%'}} id="canvas">
    </div>
  );





}

export default BodyMap;

