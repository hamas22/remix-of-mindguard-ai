import dogHero from '@/assets/dog-hero.jpg';
import dogWhite from '@/assets/dog-white.jpg';
import dogBlack from '@/assets/dog-black.jpg';
export const dogs = [
 {id:'PL-1048', name:['بندق','Bondoq'], status:'lost', area:['المعادي، القاهرة','Maadi, Cairo'], image:dogHero, color:['ذهبي • متوسط الحجم','Golden • Medium'], age:['سنتان تقريبًا','About 2 years']},
 {id:'PL-1047', name:['لوزة','Loza'], status:'treatment', area:['حلوان، القاهرة','Helwan, Cairo'], image:dogWhite, color:['أبيض وبني • متوسط الحجم','White & tan • Medium'], age:['سنة تقريبًا','About 1 year']},
 {id:'PL-1046', name:['روكي','Rocky'], status:'adoption', area:['مدينة نصر، القاهرة','Nasr City, Cairo'], image:dogBlack, color:['أسود وبني • متوسط الحجم','Black & tan • Medium'], age:['٣ سنوات تقريبًا','About 3 years']},
 {id:'PL-1045', name:['سكر','Sokkar'], status:'shelter', area:['الجيزة','Giza'], image:dogWhite, color:['أبيض • متوسط الحجم','White • Medium'], age:['سنتان تقريبًا','About 2 years']},
];
const OG_IMAGE='https://powlink.vercel.app/og-image.png';
export function pageHead(title:string, description='منصة PawLink لرعاية الكلاب البلدي ومتابعة البلاغات والإنقاذ والعلاج والإيواء والتبني.') {return {meta:[{title:`${title} | PawLink`},{name:'description',content:description},{property:'og:title',content:`${title} | PawLink`},{property:'og:description',content:description},{property:'og:type',content:'website'},{property:'og:image',content:OG_IMAGE},{name:'twitter:card',content:'summary_large_image'},{name:'twitter:image',content:OG_IMAGE}]};}
