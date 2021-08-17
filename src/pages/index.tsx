import styles from './index.less';

export default function IndexPage() {
  return (
    <div>
      <h1 className={styles.title}>Page index</h1>
    </div>
  );
}

// import React, { useState } from "react";
// import ReactDOM from "react-dom";

// export default function App() {

//   const [count, setCount] = React.useState(0)
//   const ref = React.useRef<any>();
//   const _increaseCount = () => {
//     setCount(count + 1)
//   }
//   React.useEffect(() => {
//     ref.current = count
//     console.log(ref, count)
//   }, [count])
//   const prevCount = ref.current
//   console.log(count, prevCount)

//   return (
//     <div className="App">
//       <div>Previous Count Value: {prevCount}</div>
//       <div>Current Count Value: {count}</div>
//       <button onClick={_increaseCount}>Increase Count</button>
//     </div>
//   );
// }
