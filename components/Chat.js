import React from 'react';
import { View, KeyboardAvoidingView } from 'react-native';

// Gifted Chat
import { GiftedChat, Bubble  } from 'react-native-gifted-chat';

export default class Chat extends React.Component {

  constructor() {
    super();
    this.state = {
        messages: [],
    }
  }

  // sets default message set opening
  componentDidMount() {
    this.setState({
      messages: [
        {
          _id: 1,
          text: `Hey ${this.props.route.params.name}, What's up?`,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
        {
          _id: 2,
          text: 'This is a system message',
          createdAt: new Date(),
          system: true,
        },
      ],
    })
  }

  // Adds sent message onto to message array
  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  }

  // sets up user chat bubble
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#919191'
          }
        }} 
      />
    )
  }

  render() {
    const { name, color } = this.props.route.params;

    // Populate user's name, if entered
    this.props.navigation.setOptions({ title: name });

    return (
      <View style={{ 
        flex: 1,
        backgroundColor: color
      }}>
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: 1,
          }}
        />
        { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null }
      </View>
    );
  }
}