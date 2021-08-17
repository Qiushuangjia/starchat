import moment from 'moment';

let containerStyle = {
  width: '100vw',
  background: 'linear-gradient(to bottom,#5cdbd3, #08979c)',
  minWidth: 1200,
  minHeight: 900,
  height: '100vh',
  display: 'flex',
};

export default (props: any) => {
  moment.locale('zh-cn');
  return (
    <div style={containerStyle}>
      {/* <Register></Register> */}
      {props.children}
    </div>
  );
};
