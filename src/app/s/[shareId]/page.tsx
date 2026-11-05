import Game from '@/components/Game';
export default async function SharePage({params}:{params:Promise<{shareId:string}>}){const {shareId}=await params;return <Game shareId={shareId}/>;}
