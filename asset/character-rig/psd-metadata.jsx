#target photoshop
app.displayDialogs = DialogModes.NO;
var inputs = [
  {state:"idle", file:"C:/Users/rutht/OneDrive/Desktop/Mahjong Match3/asset/tangsuit_man_cut3.psd"},
  {state:"active", file:"C:/Users/rutht/OneDrive/Desktop/Mahjong Match3/asset/tangsuit_active_cut2.psd"},
  {state:"sulk", file:"C:/Users/rutht/OneDrive/Desktop/Mahjong Match3/asset/tangsuit_sulk_cut.psd"}
];
var base = "C:/Users/rutht/OneDrive/Desktop/Mahjong Match3/asset/character-rig/psd-parts";
function px(v){try{return Math.round(v.as("px"));}catch(e){return Math.round(Number(v));}}
function safe(s){return s.replace(/[^A-Za-z0-9_-]+/g,"_").replace(/^_+|_+$/g,"")||"layer";}
function q(s){return '"'+String(s).replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\r/g,"\\r").replace(/\n/g,"\\n")+'"';}
function collect(c,p,out){for(var i=0;i<c.layers.length;i++){var l=c.layers[i];if(l.typename==="LayerSet")collect(l,p.concat([l.name]),out);else if(l.typename==="ArtLayer"&&!l.isBackgroundLayer){var b=l.bounds;out.push({name:l.name,path:p.join("/"),x:px(b[0]),y:px(b[1]),w:px(b[2])-px(b[0]),h:px(b[3])-px(b[1])});}}}
var stateStrings=[];
for(var a=0;a<inputs.length;a++){
 var item=inputs[a],doc=app.open(new File(item.file)),w=px(doc.width),h=px(doc.height),layers=[];collect(doc,[],layers);
 var entries=[];for(var n=0;n<layers.length;n++){var l=layers[n],file=("0"+(n+1)).slice(-2)+"-"+safe(l.name)+".png";entries.push('{"name":'+q(l.name)+',"path":'+q(l.path)+',"file":'+q(file)+',"x":'+l.x+',"y":'+l.y+',"w":'+l.w+',"h":'+l.h+'}');}
 stateStrings.push('{"state":'+q(item.state)+',"source":'+q(File(item.file).name)+',"canvasW":'+w+',"canvasH":'+h+',"layers":['+entries.join(',')+']}');
 doc.close(SaveOptions.DONOTSAVECHANGES);
}
var f=new File(base+"/layers.json");f.encoding="UTF8";if(!f.open("w"))throw new Error("Cannot write metadata file");f.write('{"states":['+stateStrings.join(',')+'],"errors":[]}');f.close();
