import type {Metadata} from 'next';
import PlanningApp from './planning-app';
export const metadata:Metadata={title:'TC Boden Planering',description:'Veckoplanering med behörighetsstyrda ändringsförslag för TC Boden',manifest:'/planering-app/manifest.webmanifest',appleWebApp:{capable:true,title:'TC Planering',statusBarStyle:'black-translucent'},icons:{icon:'/planning-app/icon-192.png',apple:'/planning-app/apple-touch-icon.png'},robots:{index:false,follow:false}};
export default function Page(){return <PlanningApp/>}
