import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Keyboard,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import chatService from '@/services/chatService';
import theme from '../../constants/theme';
import { useSocket } from '@/contexts/SocketContext';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

interface ChatComponentProps {
  rideId: string;
  userId: string;
  isRider: boolean;
  onEndChat?: () => void;
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  rideId,
  userId,
  isRider,
  onEndChat,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [timer, setTimer] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { isConnected, isConnecting, connectionError, connect } = useSocket();
  const scrollViewRef = useRef<ScrollView>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const messageRetryQueue = useRef<{ content: string; attempts: number }[]>([]);

  useEffect(() => {
    const showAnimation = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    });

    showAnimation.start();

    return () => {
      showAnimation.stop();
    };
  }, []);

  useEffect(() => {
    const setupChat = async () => {
      setIsLoading(true);
      try {
        if (!isConnected) {
          await connect();
        }
        chatService.joinChatRoom(rideId);
        setIsLoading(false);
      } catch (error) {
        console.error('Chat setup error:', error);
        setIsLoading(false);
      }
    };

    setupChat();

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      scrollToBottom
    );

    return () => {
      chatService.leaveChatRoom(rideId);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      keyboardDidShowListener.remove();
    };
  }, [rideId, isConnected]);

  // Process message retry queue
  useEffect(() => {
    if (isConnected && messageRetryQueue.current.length > 0) {
      const processQueue = async () => {
        const message = messageRetryQueue.current[0];
        if (message && message.attempts < 3) {
          message.attempts++;
          const success = await chatService.sendMessage(rideId, message.content);
          if (success) {
            messageRetryQueue.current.shift();
          }
        } else if (message) {
          messageRetryQueue.current.shift();
          Alert.alert('Message Failed', 'Unable to send message after multiple attempts');
        }
      };
      processQueue();
    }
  }, [isConnected, rideId]);

  useEffect(() => {
    chatService.onNewMessage((message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
      if (message.senderId !== userId) {
        Vibration.vibrate(100);
      }
    });

    chatService.onRiderArrived(({ location }) => {
      if (location === 'pickup') {
        Alert.alert('Rider Arrived', 'The rider has arrived at your pickup location!');
        startTimer();
      } else if (location === 'destination') {
        stopTimer();
        Alert.alert('Destination Reached', 'You have arrived at your destination!');
      }
    });
  }, [userId]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleSend = async () => {
    if (!isConnected) {
      messageRetryQueue.current.push({ content: newMessage.trim(), attempts: 0 });
      setNewMessage('');
      Alert.alert('Offline', 'Message will be sent when connection is restored');
      return;
    }

    if (newMessage.trim() && !isSending) {
      setIsSending(true);
      try {
        const success = await chatService.sendMessage(rideId, newMessage.trim());
        if (success) {
          setNewMessage('');
          inputRef.current?.clear();
        } else {
          messageRetryQueue.current.push({ content: newMessage.trim(), attempts: 0 });
          setNewMessage('');
          Alert.alert('Message Queued', 'Message will be retried automatically');
        }
      } catch (error) {
        console.error('Send message error:', error);
        Alert.alert('Error', 'Failed to send message. It will be retried automatically.');
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleEndChat = () => {
    Alert.alert(
      'Confirm Arrival',
      'Are you sure you want to mark your arrival?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            if (isRider) {
              chatService.markRiderArrived(rideId, 'pickup');
            }
            if (onEndChat) {
              onEndChat();
            }
          },
        },
      ]
    );
  };

  const startTimer = () => {
    setIsTimerRunning(true);
    setTimer(0);
    timerIntervalRef.current = setInterval(() => {
      setTimer((prev) => (prev !== null ? prev + 1 : 0));
    }, 1000);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.COLORS.primary} />
        <Text style={styles.loadingText}>Connecting to chat...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {connectionError && (
        <MotiView
          from={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 40 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.connectionError}
        >
          <Text style={styles.connectionErrorText}>{connectionError}</Text>
          {isConnecting ? (
            <ActivityIndicator size="small" color={theme.COLORS.white} />
          ) : (
            <TouchableOpacity onPress={connect}>
              <Ionicons name="refresh" size={24} color={theme.COLORS.white} />
            </TouchableOpacity>
          )}
        </MotiView>
      )}

      {isTimerRunning && timer !== null && (
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.timerContainer}
        >
          <Text style={styles.timerText}>Trip Time: {formatTime(timer)}</Text>
        </MotiView>
      )}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          onContentSizeChange={scrollToBottom}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message, index) => (
            <MotiView
              key={message.id}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 300, delay: index * 100 }}
              style={[
                styles.messageWrapper,
                message.senderId === userId
                  ? styles.sentMessage
                  : styles.receivedMessage,
              ]}
            >
              <Text style={[
                styles.messageText,
                message.senderId !== userId && styles.receivedMessageText
              ]}>
                {message.content}
              </Text>
              <Text style={[
                styles.timestamp,
                message.senderId !== userId && styles.receivedTimestamp
              ]}>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </MotiView>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor={theme.COLORS.textSecondary}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={[styles.sendButton, isSending && styles.sendingButton]}
            disabled={isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={theme.COLORS.white} />
            ) : (
              <Ionicons name="send" size={24} color={theme.COLORS.white} />
            )}
          </TouchableOpacity>
        </View>

        {isRider && !isTimerRunning && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300 }}
          >
            <TouchableOpacity
              onPress={handleEndChat}
              style={styles.endChatButton}
              activeOpacity={0.8}
            >
              <Text style={styles.endChatButtonText}>Mark Arrival</Text>
            </TouchableOpacity>
          </MotiView>
        )}
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.background,
  },
  loadingText: {
    marginTop: theme.SPACING.md,
    color: theme.COLORS.textSecondary,
    ...theme.FONTS.medium,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  timerContainer: {
    padding: theme.SPACING.md,
    backgroundColor: theme.COLORS.surface,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.border,
    ...theme.SHADOWS.small,
  },
  timerText: {
    fontSize: theme.FONTS.sizes.lg,
    fontWeight: 'bold',
    color: theme.COLORS.primary,
  },
  messagesContainer: {
    flex: 1,
    padding: theme.SPACING.md,
  },
  messageWrapper: {
    maxWidth: '80%',
    marginVertical: theme.SPACING.xs,
    padding: theme.SPACING.md,
    borderRadius: theme.BORDER_RADIUS.lg,
    ...theme.SHADOWS.small,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.COLORS.primary,
    borderBottomRightRadius: 4,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.COLORS.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: theme.COLORS.white,
    fontSize: theme.FONTS.sizes.md,
    ...theme.FONTS.regular,
  },
  receivedMessageText: {
    color: theme.COLORS.text,
  },
  timestamp: {
    fontSize: theme.FONTS.sizes.xs,
    color: theme.COLORS.white,
    marginTop: theme.SPACING.xs,
    opacity: 0.7,
  },
  receivedTimestamp: {
    color: theme.COLORS.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: theme.SPACING.md,
    borderTopWidth: 1,
    borderTopColor: theme.COLORS.border,
    alignItems: 'center',
    backgroundColor: theme.COLORS.background,
    ...theme.SHADOWS.small,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.COLORS.border,
    borderRadius: theme.BORDER_RADIUS.round,
    paddingHorizontal: theme.SPACING.lg,
    paddingVertical: theme.SPACING.sm,
    marginRight: theme.SPACING.sm,
    maxHeight: 100,
    color: theme.COLORS.text,
    backgroundColor: theme.COLORS.surface,
    ...theme.FONTS.regular,
  },
  sendButton: {
    backgroundColor: theme.COLORS.primary,
    borderRadius: theme.BORDER_RADIUS.round,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.SHADOWS.small,
  },
  sendingButton: {
    opacity: 0.7,
  },
  endChatButton: {
    backgroundColor: theme.COLORS.primary,
    padding: theme.SPACING.lg,
    margin: theme.SPACING.md,
    borderRadius: theme.BORDER_RADIUS.md,
    alignItems: 'center',
    ...theme.SHADOWS.medium,
  },
  endChatButtonText: {
    color: theme.COLORS.white,
    fontSize: theme.FONTS.sizes.lg,
    ...theme.FONTS.bold,
  },
  connectionError: {
    backgroundColor: theme.COLORS.error,
    padding: theme.SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connectionErrorText: {
    color: theme.COLORS.white,
    fontSize: theme.FONTS.sizes.sm,
    ...theme.FONTS.medium,
  },
});

export default React.memo(ChatComponent); 