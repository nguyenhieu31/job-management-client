import { useMemo } from 'react'
import { useRouter as useRoutes } from "next/navigation";
function useRouter() {
    const routes= useRoutes();
    const router= useMemo(
        ()=>({
            back: ()=> {
                routes.back();
            },
            forward: ()=> routes.forward(),
            reload: ()=> window.location.reload(),
            push: (href:string)=>{
                routes.push(href)
            },
            replace: (href: string)=> routes.replace(href),
        }),
        [routes]
    )
  return router;
}

export default useRouter;