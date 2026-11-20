#target photoshop
app.displayDialogs = DialogModes.NO;
var inputs = [
  {state:"idle", file:"C:/Users/rutht/OneDrive/Desktop/Mahjong Match3/asset/tangsuit_man_cut3.psd"},
  {state:"active", file:"C:/Users/rutht/OneDrive/Desktop/Mahjong Match3/asset/tangsuit_active_cut2.psd"},
  {state:"sulk", file:"C:/Users/rutht/OneDrive/Desktop/Mahjong Match3/asset/tangsuit_sulk_cut.psd"}
];
var base = "C:/Users/rutht/OneDrive/Desktop/Mahjong Match3/asset/character-rig/psd-parts";
function px(v){ try{return Math.round(v.as("px"));}catch(e){return Math.round(Number(v));} }
function safe(s){ return s.replace(/[^A-Za-z0-9_-]+/g,"_").replace(/^_+|_+$/g,"") || "layer"; }
function collect(container, parents, out){
  for(var i=0;i<container.layers.length;i++){
    var l=container.layers[i];
    if(l.typename==="LayerSet") collect(l,parents.concat([l]),out);
    else if(l.typename==="ArtLayer" && !l.isBackgroundLayer){
      var b=l.bounds;
      out.push({layer:l,parents:parents.slice(),name:l.name,left:px(b[0]),top:px(b[1]),right:px(b[2]),bottom:px(b[3])});
    }
  }
}
function snapshot(container,out){for(var i=0;i<container.layers.length;i++){var l=container.layers[i];out.push({layer:l,visible:l.visible});if(l.typename==="LayerSet")snapshot(l,out);}}
function hide(container){for(var i=0;i<container.layers.length;i++){var l=container.layers[i];l.visible=false;if(l.typename==="LayerSet")hide(l);}}
function exportOne(entry,state,docW,docH,index){
  var dir=new Folder(base+"/"+state);if(!dir.exists)dir.create();
  var snap=[];snapshot(app.activeDocument,snap);hide(app.activeDocument);
  for(var j=0;j<entry.parents.length;j++)entry.parents[j].visible=true;
  entry.layer.visible=true;
  var merged=app.activeDocument.duplicate("psd_export_"+state+"_"+index,true);
  merged.trim(TrimType.TRANSPARENT,true,true,true,true);
  var png=new File(dir.fsName+"/"+("0"+index).slice(-2)+"-"+safe(entry.name)+".png");
  var opts=new PNGSaveOptions();opts.compression=9;opts.interlaced=false;
  merged.saveAs(png,opts,true,Extension.LOWERCASE);
  var outW=px(merged.width),outH=px(merged.height);
  merged.close(SaveOptions.DONOTSAVECHANGES);
  for(var k=0;k<snap.length;k++)snap[k].layer.visible=snap[k].visible;
  return {name:entry.name,file:png.name,x:entry.left,y:entry.top,w:entry.right-entry.left,h:entry.bottom-entry.top,canvasW:docW,canvasH:docH,exportW:outW,exportH:outH};
}
var report={states:[],errors:[]};
for(var a=0;a<inputs.length;a++){
  var item=inputs[a],file=new File(item.file);
  if(!file.exists){report.errors.push("Missing "+item.file);continue;}
  var doc=app.open(file),w=px(doc.width),h=px(doc.height),layers=[];
  collect(doc,[],layers);
  var state={state:item.state,source:file.name,canvasW:w,canvasH:h,layers:[]};
  for(var n=0;n<layers.length;n++){
    try{state.layers.push(exportOne(layers[n],item.state,w,h,n+1));}
    catch(e){report.errors.push(item.state+" / "+layers[n].name+": "+e.toString());}
  }
  report.states.push(state);
  doc.close(SaveOptions.DONOTSAVECHANGES);
}
var jf=new File(base+"/layers.json"),parent=jf.parent;if(!parent.exists)parent.create();jf.encoding="UTF8";jf.open("w");jf.write(JSON.stringify(report,null,2));jf.close();
alert("PSD layer export complete. States: "+report.states.length+". Errors: "+report.errors.length+". Metadata: "+jf.fsName);
