import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import JsCookie from 'js-cookie';
import { useEffect } from 'react';
import { store, useAppDispatch, useAppSelector } from '@/store/store';
import { CheckSessionLoginAction } from '@/store/slice/authentication/Authentication';
import { toast } from 'react-toastify';
import { addNotificationLocal } from '@/store/slice/notification/Notification';
import { createJobRealTime, deleteJobByIdRealTime, deleteMultipleJobsRealTime, updateJob, updatePaymentEmployeeMultipleJobsRealTime } from '@/store/slice/jobs/Jobs';
import { createVideoRealTime, deleteMultipleVideosRealTime, deleteVideoByIdRealTime, updatePaymentEmployeeMultipleVideosRealTime, updateVideo } from '@/store/slice/videos/Videos';
let stompClient: Client;
// const websocketUrl = "https://clientportal24h.com/api/v1/ws";
const websocketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8086/api/v1/ws';
export const WebsocketConnection: React.FC = () => {
    const dispatch = useAppDispatch();
    const {email, isLoginned } = useAppSelector((state) => state.authenticate);
    useEffect(() => {
        const token = JsCookie.get('accessToken');
        if (!token || !email || !isLoginned) {
            console.error('No access token found');
            dispatch(CheckSessionLoginAction());
            return;
        }

        stompClient = new Client({
            webSocketFactory: () => new SockJS(websocketUrl, null, { 
                transports: ['websocket', 'xhr-streaming', 'xhr-polling']
            }),
            connectHeaders: {
                token: token,
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str) => {
                console.log('STOMP Debug:', str);
            },
        });

        stompClient.onConnect = () => {
            console.log('WebSocket Connected!');
            stompClient?.subscribe(`/user/${email}/queue/notifications`, (message) => {
                const data = JSON.parse(message.body);
                console.log('Received notification:', data);
                dispatch(addNotificationLocal(data));
            });

            stompClient?.subscribe(`/user/${email}/queue/update-job`, (message) => {
                const data = JSON.parse(message.body);
                console.log('Received job response update:', data);
                dispatch(updateJob(data));
            });

            stompClient?.subscribe(`/user/${email}/queue/create-job`, (message) => {
                const data = JSON.parse(message.body);
                console.log('Received job response create:', data);
                dispatch(createJobRealTime(data));
            });

            stompClient?.subscribe(`/user/${email}/queue/delete-job`, (message) => {
                const data = JSON.parse(message.body);
                console.log('Received job response delete:', data);
                dispatch(deleteJobByIdRealTime(data));
            });

            stompClient?.subscribe(`/user/${email}/queue/delete-job-user-specific`, (message) => {
                const data = JSON.parse(message.body);
                console.log('Received job response delete:', data);
                dispatch(deleteJobByIdRealTime(data));
            });

            stompClient?.subscribe(`/user/${email}/queue/delete-multiple-job`, (message) => {
                const data = JSON.parse(message.body);
                console.log('Received job response delete multiple:', data);
                dispatch(deleteMultipleJobsRealTime(data));
            });

            stompClient?.subscribe(`/user/${email}/queue/update-payment-employee-status-job`, (message) => {
                const data = JSON.parse(message.body);
                console.log('Received job response update payment employee status:', data);
                dispatch(updatePaymentEmployeeMultipleJobsRealTime(data));
            });


            stompClient?.subscribe(`/user/${email}/queue/update-video`, (message) => {
                const data = JSON.parse(message.body);
                console.log('Received video response update:', data);
                dispatch(updateVideo(data));
            });

            stompClient?.subscribe(`/user/${email}/queue/create-video`, (message) => {
                const data = JSON.parse(message.body);
                console.log('Received video response create:', data);
                dispatch(createVideoRealTime(data));
            });

            stompClient?.subscribe(`/user/${email}/queue/delete-video`, (message) => {
                const data = JSON.parse(message.body);
                console.log('Received video response delete:', data);
                dispatch(deleteVideoByIdRealTime(data));
            });

            stompClient?.subscribe(`/user/${email}/queue/delete-video-user-specific`, (message) => {
                const data = JSON.parse(message.body);
                console.log('Received video response delete by user specific:', data);
                dispatch(deleteVideoByIdRealTime(data));
            });

            stompClient?.subscribe(`/user/${email}/queue/delete-multiple-video`, (message) => {
                const data = JSON.parse(message.body);
                console.log('Received video response delete multiple:', data);
                dispatch(deleteMultipleVideosRealTime(data));
            });

            stompClient?.subscribe(`/user/${email}/queue/update-payment-employee-status-video`, (message) => {
                const data = JSON.parse(message.body);
                console.log('Received video response update payment employee status:', data);
                dispatch(updatePaymentEmployeeMultipleVideosRealTime(data));
            });
        };

        stompClient.onStompError = (frame) => {
            console.error('Broker reported error:', frame.headers['message']);
            console.error('Additional details:', frame.body);
        };

        stompClient.activate();

        return () => {
            stompClient?.deactivate();
        };
    }, [dispatch, email, isLoginned]);
    return null;
};

export const getStompClient = (): Client | undefined => {
    return stompClient;
};

export const sendGroupChatMessage = (): void => {
    if (!stompClient || !stompClient.connected) {
        console.error('WebSocket connection not established');
        toast.error('Không thể gửi tin nhắn. Kết nối WebSocket chưa được thiết lập.');
        return;
    }

    const state = store.getState();
    // Get username and profilePicture from Redux store
    const username = state.authenticate.email
    if (!username) {
        console.error('User not authenticated');
        toast.error('Vui lòng đăng nhập để gửi tin nhắn.');
        return;
    }
    try {
        stompClient.publish({
            destination: `/app/chat.private`,
            body: JSON.stringify(username),
        });
    } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.');
    }
};