const canvas=document.getElementById("stars");
const ctx=canvas.getContext("2d");

canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

let stars=[];

for(let i=0;i<140;i++){
stars.push({
x:Math.random()*canvas.width,
y:Math.random()*canvas.height,
speed:Math.random()*0.7+0.2
});
}

function animate(){

ctx.clearRect(0,0,canvas.width,canvas.height);

ctx.fillStyle="white";

stars.forEach(s=>{

s.y+=s.speed;

if(s.y>canvas.height){
s.y=0;
s.x=Math.random()*canvas.width;
}

ctx.fillRect(s.x,s.y,2,2);

});

requestAnimationFrame(animate);

}

animate();