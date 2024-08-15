 
 import React from "react"
 

 export default function Arrow({arrows}){


    return(<>

     {/* SVG arrows */}
 <svg
 className="absolute top-0 left-0 w-full h-full pointer-events-none"
 xmlns="http://www.w3.org/2000/svg"
>
 <defs>
   <marker
     id="arrowhead"
     markerWidth="10"
     markerHeight="7"
     refX="10"
     refY="3.5"
     orient="auto"
   >
     <polygon points="0 0, 10 3.5, 0 7" fill="black" />
   </marker>
 </defs>
 {arrows.map((arrow, index) => (
   <line
     key={index}
     x1={arrow.startX}
     y1={arrow.startY}
     x2={arrow.endX}
     y2={arrow.endY}
     stroke="black"
     strokeWidth="2"
     markerEnd="url(#arrowhead)"
   />
 ))}
</svg>
    
    
    
    
    </>)
 }
