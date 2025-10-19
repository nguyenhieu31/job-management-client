import styles from '@/styles/loader.module.scss';
interface PropsStyle{
  color?: string;
  width: number;
  height?: number;
}

const Loader = ({width,height}:PropsStyle) => {
  return (
    <div className={styles.loader} style={{width:`${width}px`, height: height ? `${height}px` : 'auto'}}></div>
  )
}

export default Loader