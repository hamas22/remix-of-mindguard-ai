const logo = { url: '/powlink-logo.png' };
interface LogoProps { className?: string; size?: number }
export function Logo({className='',size=36}:LogoProps) {return <img src={logo.url} alt="PawLink" width={size*2} height={size*1.33} className={`object-contain shrink-0 ${className}`} />;}
export function LogoMark({className=''}:{className?:string}) {return <Logo size={80} className={className}/>;}
