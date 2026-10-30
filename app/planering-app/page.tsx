import type {Metadata} from 'next';
import PlanningApp from './planning-app';
export const metadata:Metadata={title:'TC Boden Planering',description:'Skrivskyddad veckoplanering för TC Boden',manifest:'/planering-app/manifest.webmanifest',appleWebApp:{capable:true,title:'TC Planering',statusBarStyle:'black-translucent'},icons:{icon:'/icon-192.png',apple:'/apple-touch-icon.png'},robots:{index:false,follow:false}};
export default function Page(){return <PlanningApp/>}
