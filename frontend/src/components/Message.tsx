import type { Message } from "../types/message";

interface Props {
    message: Message;
}

export const MessageItem = ({ message }: Props) => {
    const isUser = message.role === 'user';

    return (
    <div className={isUser ? "message-item user-message" : "message-item assistant-message"}>
        {message.content}
    </div>
    );
};