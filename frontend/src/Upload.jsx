import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactDOM from "react-dom/client";

function Upload() {

    return (
        <div className="dashboard">
            <p>a component 2</p>
        </div>
    );
}

// const rootElement = document.getElementById("upload");

// const domNode = document.getElementById('upload');
// if (!domNode) {
//     console.log("no upload id"); 
// } else {
//     const root = createRoot(domNode);
//     // root.render(<Upload />); 
//     root.render(
//         <React.StrictMode>
//           <Upload />
//         </React.StrictMode>
//       );
// }
// const root = createRoot(document.getElementById('upload'));
// root.render(
//   <React.StrictMode>
//     <Upload />
//   </React.StrictMode>
// );


let container = document.getElementById('upload')
// if(container) (container as HTMLFormElement).reset(); 
if (container) {
    const root = ReactDOM.createRoot(container);

    root.render(
        <React.StrictMode>
            <Upload />
        </React.StrictMode>,
    );

}
// if(container){
//     const root = ReactDOM.createRoot(container); 

//     root.render(
//       <React.StrictMode>
//           <Upload />
//       </React.StrictMode>,
//     );
// } else {
//     console.log("root not found")
// }

export default Upload