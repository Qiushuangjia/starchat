import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { base_url } from '../../config/config';
import { post } from '../../config/http';
import { history } from 'umi';
import {
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
} from '../../config/localStorage';

// const formItemLayout = {
//     labelCol: {
//         xs: { span: 20 },
//         sm: { span: 11 },
//     },
//     wrapperCol: {
//         xs: { span: 24 },
//         sm: { span: 5 },
//     },
// };
// const tailFormItemLayout = {
//     wrapperCol: {
//         sm: {
//             offset: 13,
//         },
//     },
// };
const inputStyle = {
  width: '30vw',
};
export default function Login(props: any) {
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    let res = await post(`${base_url}/login`, values);
    if (res.data) {
      message.info('登录成功!');
      setLocalStorage('user', res.data);
      history.replace('/');
    } else {
      message.error('登录失败!');
    }
  };

  return (
    <div
      style={{
        alignSelf: 'center',
        width: '35vw',
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      <Form form={form} name="login" onFinish={onFinish} scrollToFirstError>
        <Form.Item
          name="nickname"
          label="昵称"
          rules={[
            { required: true, message: '请输入用户名!', whitespace: true },
          ]}
        >
          <Input style={inputStyle} />
        </Form.Item>
        <Form.Item
          name="password"
          label="密码"
          rules={[
            {
              required: true,
              message: '请输入密码!',
            },
          ]}
          hasFeedback
        >
          <Input.Password style={inputStyle} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            <p>登录</p>
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
