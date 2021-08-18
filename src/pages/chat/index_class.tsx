import { Socket } from '../config/socket';
import React, { useEffect, useState, useRef, Component } from 'react';
import { Input, Button } from 'antd';
import './index.less';
import {
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
} from '../config/localStorage';
import { get } from '@/pages/config/http';
import { ManOutlined, WomanOutlined } from '@ant-design/icons';
import moment from 'moment';
import { history } from 'umi';
import _ from 'lodash';
import { base_url } from '@/pages/config/config';

const { TextArea } = Input;

let socket: any;
export default class Index extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      message: '',
      messages: [],
      list: [],
      recipient: '',
      chatList: [],
      user: {},
    };
  }

  submit() {
    let { message, recipient, user } = this.state;
    if (message !== '') {
      socket.emit('chat', {
        message,
        recipient,
        date: moment().toDate(),
        sender: user.name,
      });
      this.setState({
        message: '',
      });
    }
  }

  /**
   * 获取所有用户聊天信息
   * @param user 当前用户
   */
  async getChatList(user: any) {
    let { messages, list } = this.state;
    let res = await get(`${base_url}/user_list`, { name: user.name });
    let { data } = res;
    data.forEach((item: any) => {
      messages.push(...item.messages);
    });
    data = _.orderBy(data, 'date', 'desc');
    list.push(...data);
    this.setState({
      list,
      messages,
    });
  }

  componentDidMount() {
    let user = getLocalStorage('user');
    if (!user) {
      history.replace('/login');
      return;
    }
    this.setState({
      user,
    });
    this.getChatList(user);
    socket = Socket(`${base_url}?name=chat`);
    socket.on('chat', (data: any) => {
      let { list, messages, recipient } = this.state;
      if (data && data.recipient) {
        let reloadList = _.orderBy(list, 'date', 'desc');
        this.setState({
          list: reloadList,
        });
      }
      let cloneMessages = _.cloneDeep(messages);
      cloneMessages.push(data);
      this.setState({
        messages: cloneMessages,
      });
    });

    socket.on('exit', (data: any) => {
      let { list, messages, recipient } = this.state;
      // 监听用户退出
      let cloneMessages = _.cloneDeep(messages);
      list = list.filter((item: any) => item.name !== data.name);
      cloneMessages = _.orderBy(cloneMessages, 'date', 'asc');
      cloneMessages = cloneMessages.filter(
        (item: any) =>
          item.recipient !== data.name && item.sender !== data.name,
      );
      if (recipient === data.name) {
        recipient = '';
      }
      this.setState({
        recipient,
        list,
        messages: cloneMessages,
      });
    });
    socket.on('join', async (data: any) => {
      let { list, messages, recipient } = this.state;
      // 监听用户进入
      let res = await get(`${base_url}/login_user_list`, {
        name: user ? user['name'] : '',
        friend: data.name,
      });
      let cloneMessages = _.cloneDeep(messages);
      cloneMessages.push(res.data.messages);
      list.push(res.data);
      this.setState({
        list,
        messages: cloneMessages,
      });
    });
  }

  // 聊天滚动条跟随
  scrollBottom = () => {
    let dom = document.getElementsByClassName('chat_window')[0];
    let domScrollHeight = dom.scrollHeight;
    let domScrollTop = dom.scrollTop;
    // if (domScrollHeight - domScrollTop > 200) {
    // console.log(domScrollTop, domScrollHeight,'2233333')
    dom.scrollTop = domScrollHeight;
    console.log('???', dom.scrollTop, domScrollHeight);
    // }
  };

  componentDidUpdate(prevProps: any, prevState: any) {
    if (
      !_.isEqual(prevState.messages, this.state.messages) ||
      prevState.recipient !== this.state.recipient
    ) {
      let { messages, recipient, user } = this.state;
      let cloneMessages = _.cloneDeep(messages);
      let list = _.orderBy(cloneMessages, 'date', 'asc');
      let chatList = list.filter(
        (item: any) =>
          (item.recipient === recipient && item.sender === user.name) ||
          (item.sender === recipient && item.recipient === user.name),
      );
      this.setState({
        chatList,
      });
      setTimeout(() => {
        this.scrollBottom();
      });
      console.log(1111);
    }
  }

  // 退出登录清除用户信息
  clearUserInfo = () => {
    let { user } = this.state;
    removeLocalStorage('user');
    history.replace('/login');
    socket.emit('exit', { name: user.name, date: moment().toDate() });
  };
  render() {
    let { user, list, chatList, recipient, message } = this.state;
    return (
      <div className={'container'}>
        <div className={'title_user'}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className={'user_avatar'}>
              {_.isEmpty(user) ? '' : user.name[0]}
            </div>
            {user.name}
          </div>
          <Button
            onClick={() => {
              this.clearUserInfo();
            }}
          >
            退出登录
          </Button>
        </div>
        <div className={'chat_list'}>
          {list.map((item: any, i: number) => {
            let { name, avatar, sex } = item;
            return (
              <div
                key={i}
                onClick={() => {
                  this.setState(
                    {
                      message: '',
                      recipient: name,
                    },
                    () => {
                      setTimeout(() => {
                        this.scrollBottom();
                      });
                    },
                  );
                }}
                className={`chat_list_item ${
                  recipient === name ? 'item_active' : ''
                }`}
              >
                <div className={'list_user_avatar'}>{name[0]}</div>
                <p className={'user_name'}>{name}</p>
                {sex ? (
                  <ManOutlined style={{ color: '#0091ff' }} />
                ) : (
                  <WomanOutlined style={{ color: '#ff4d94' }} />
                )}
              </div>
            );
          })}
        </div>
        <div className={'chat_content'}>
          <p className={'chat_window_user'}>{recipient}</p>
          <div className={'chat_window'}>
            <div style={{ padding: '1vw' }}>
              {chatList.map((val: any, i: number) => {
                let is_self = val.sender === user.name;
                return (
                  <div
                    key={i}
                    className={'chat_user'}
                    style={is_self ? { flexDirection: 'row-reverse' } : {}}
                  >
                    <div
                      className={'chat_user_avatar'}
                      style={is_self ? { marginRight: '0', marginLeft: 5 } : {}}
                    >
                      {val.sender[0]}
                      <p
                        className={'chat_time'}
                        style={
                          is_self ? { left: '-117px' } : { right: '-123px' }
                        }
                      >
                        {moment(val.date).format('lll')}
                      </p>
                    </div>
                    <div style={{ fontSize: '1.5vh' }}>
                      <p className={'chat_info'}>{val.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <TextArea
            disabled={_.isEmpty(list) || !recipient}
            className={'chat_input'}
            value={message}
            onPressEnter={(e) => {
              if (_.isEmpty(list) || !recipient) return;
              e.preventDefault();
              this.submit();
            }}
            onChange={(e) => {
              this.setState({
                message: e.target.value,
              });
            }}
          ></TextArea>
          <Button
            disabled={_.isEmpty(list) || !recipient}
            className={'message_send'}
            onClick={() => {
              this.submit();
            }}
          >
            发送
          </Button>
        </div>
      </div>
    );
  }
}
