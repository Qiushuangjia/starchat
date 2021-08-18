import { Socket } from '../config/socket';
import React, { useEffect, useState, useRef } from 'react';
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
export default function Chat(props: any) {
  const [name, setName] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [messages, pushMessage] = useState<any>([]);
  const [list, setList] = useState<any>([]);
  const [recipient, setRecipient] = useState<string>('');
  const [chatList, setChatList] = useState<any>([]);
  const [user, setUser] = useState<any>({});
  const listRef = useRef(list);
  const messagesRef = useRef(messages);
  const recipientRef = useRef(recipient);

  const submit = () => {
    socket.emit('chat', {
      message,
      recipient,
      date: moment().toDate(),
      sender: user.name,
    });
    setMessage('');
  };

  /**
   * 获取所有用户聊天信息
   * @param user 当前用户
   */
  const getChatList = async (user: any) => {
    let res = await get(`${base_url}/user_list`, { name: user.name });
    let { data } = res;
    data.forEach((item: any) => {
      messages.push(...item.messages);
      pushMessage(messages);
    });
    data = _.orderBy(data, 'date', 'desc');
    list.push(...data);
    setList([...list]);
    // if (!_.isEmpty(data)) {
    //     setRecipient(data[0].name)
    // }
  };

  useEffect(() => {
    let user = getLocalStorage('user');
    if (!user) {
      history.replace('/login');
      return;
    }
    setUser(user);
    getChatList(user);
    socket = Socket(`${base_url}?name=chat`);
    socket.on('chat', (data: any) => {
      if (data && data.recipient) {
        let recipientUser = list.find(
          (item: any) => item.name === data.recipient,
        );
        if (recipientUser) {
          recipientUser.date = data.date;
        }
        let reloadList = _.orderBy(list, 'date', 'desc');
        setList(reloadList);
      }
      messages.push(data);
      pushMessage([...messages]);
    });

    socket.on('exit', (data: any) => {
      // 监听用户退出
      let { current } = listRef;
      current = list.filter((item: any) => item.name !== data.name);
      messagesRef.current = _.orderBy(messagesRef.current, 'date', 'asc');
      messagesRef.current = messagesRef.current.filter(
        (item: any) =>
          item.recipient !== data.name && item.sender !== data.name,
      );
      if (recipientRef.current === data.name) {
        recipientRef.current = '';
        setRecipient('');
      }
      pushMessage([...messagesRef.current]);
      setList(current);
      console.log(current);
    });
    socket.on('join', async (data: any) => {
      // 监听用户进入
      console.log(listRef.current, list, '!!!!!!');
      let { current } = listRef;
      let res = await get(`${base_url}/login_user_list`, {
        name: user ? user['name'] : '',
        friend: data.name,
      });
      messagesRef.current.push(res.data.messages);
      current.push(res.data);
      setList(current);
      pushMessage([...messagesRef.current]);
    });
  }, []);

  // 聊天滚动条跟随
  const scrollBottom = () => {
    let dom = document.getElementsByClassName('chat_window')[0];
    let domScrollHeight = dom.scrollHeight;
    let domScrollTop = dom.scrollTop;
    // if (domScrollHeight - domScrollTop > 200) {
    // console.log(domScrollTop, domScrollHeight,'2233333')
    dom.scrollTop = domScrollHeight;
    // }
  };

  // 当前聊天信息
  useEffect(() => {
    let list = _.orderBy(messagesRef.current, 'date', 'asc');
    let chat_list = list.filter(
      (item: any) => item.recipient === recipient || item.sender === recipient,
    );
    setChatList([...chat_list]);
    scrollBottom();
  }, [messages, recipient, list]);

  useEffect(() => {
    scrollBottom();
  }, [chatList]);

  // 退出登录清除用户信息
  const clearUserInfo = () => {
    removeLocalStorage('user');
    history.replace('/login');
    socket.emit('exit', { name: user.name, date: moment().toDate() });
  };

  console.log(list, listRef.current, '.............');
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
            clearUserInfo();
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
                setMessage('');
                setRecipient(name);
                recipientRef.current = name;
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
                      style={is_self ? { left: '-117px' } : { right: '-123px' }}
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
            submit();
          }}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
        ></TextArea>
        <Button
          disabled={_.isEmpty(list) || !recipient}
          className={'message_send'}
          onClick={() => {
            submit();
          }}
        >
          发送
        </Button>
      </div>
    </div>
  );
}
