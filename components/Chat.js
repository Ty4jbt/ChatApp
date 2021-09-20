import React from 'react';
import { View, KeyboardAvoidingView } from 'react-native';

// Gifted Chat
import { GiftedChat, Bubble  } from 'react-native-gifted-chat';

// importing Firebase Firestore
const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends React.Component {

  constructor() {
    super();
    this.state = {
      user: {
        _id: '',
        name: '',
        avatar: '',
      },
      messages: [],
    }

    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyAu5d3-VUBGZIrYMje8Lovas9OzHOTQIzU",
        authDomain: "chatapp-f9d64.firebaseapp.com",
        projectId: "chatapp-f9d64",
        storageBucket: "chatapp-f9d64.appspot.com",
        messagingSenderId: "446793751714",
        appId: "1:446793751714:web:847eccff3f49c8aa128bfb"
      });
    }

    this.referenceChatMessages = firebase
      .firestore()
      .collection("messages");
  }

  // sets default message set opening
  componentDidMount() {
    this.referenceChatMessages = firebase.firestore().collection('messages').where("uid", "==", this.state.uid);
    this.unsubscribe = this.referenceChatMessages.onSnapshot(this.onCollectionUpdate)

    this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        firebase.auth().signInAnonymously();
      }
      this.setState({
        user: {
          _id: user.uid,
          name: name,
          avatar: 'https://placeimg.com/140/140/any',
          createdAt: new Date().getTime(),
        },
        messages: [],
      });
      this.unsubscribe = this.referenceChatMessages
        .orderBy("createdAt", "desc")
        .onSnapshot(this.onCollectionUpdate);
    });
  }

  componentWillUnmount() {
    // Stop listening for authentication
    this.unsubscribe();

    // Stop listening for collection changes
    this.authUnsubscribe();
  }

  // 
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      var data = doc.data();
      messages.push({
        createdAt: data.createdAt.toDate(),
        text: data.text,
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar,
        },
      });
    });
    this.setState({
      messages,
    });
  };

  // Adds sent message onto to message array
  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  }

  addMessage() {
    const message = this.state.messages[0];
    this.referenceChatMessages.add({
      _id: message._id,
      createdAt: message.createdAt.toString(),
      text: message.text || '',
      user: message.user,
      image: message.image || null,
      location: message.location || null,
    });
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