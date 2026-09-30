import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata:Metadata={
 title:'TC Boden | Bedömningsstöd',
 description:'Uppföljning av utbildning och bedömning per elev',
 manifest:'/manifest.webmanifest',
 icons:{icon:[{url:'/favicon-32.png',sizes:'32x32',type:'image/png'},{url:'/favicon-16.png',sizes:'16x16',type:'image/png'}],shortcut:'/favicon.ico',apple:[{url:'/apple-touch-icon.png',sizes:'180x180',type:'image/png'}]},
 appleWebApp:{capable:true,title:'TC Boden',statusBarStyle:'default'}
};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#292929'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="sv"><body>{children}</body></html>}
