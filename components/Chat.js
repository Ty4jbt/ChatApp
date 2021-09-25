import React from 'react';
import { View, KeyboardAvoidingView } from 'react-native';

// Gifted Chat
import { GiftedChat, Bubble  } from 'react-native-gifted-chat';

import firebase from "firebase";
import("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyAu5d3-VUBGZIrYMje8Lovas9OzHOTQIzU",
  authDomain: "chatapp-f9d64.firebaseapp.com",
  projectId: "chatapp-f9d64",
  storageBucket: "chatapp-f9d64.appspot.com",
  messagingSenderId: "446793751714",
};
export default class Chat extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      uid: 0,
      loggedIntext: "logging in...",
      user: {
        _id: '',
        name: ''
      }
    }

    if (!firebase.apps.length){
      firebase.initializeApp(firebaseConfig);
    }
    
    // Allows you to refence firestore data
    this.referenceChatMessages = firebase.firestore().collection("messages");

  }

  // sets default message set opening
  componentDidMount() {
    const name = this.props.route.params.name;
    
    this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        firebase.auth().signInAnonymously();
      }
      this.setState({
        uid: user.uid,
        messages: [],
        user: {
          _id: user.uid,
          name: name,
        }
      });
      this.referenceMessagesUser = firebase
        .firestore()
        .collection("messages")
        .where("uid", "==", this.state.uid);

      this.unsubscribe = this.referenceChatMessages
        .orderBy("createdAt", "desc")
        .onSnapshot(this.onCollectionUpdate);
    });
  }

  // Stops updating
  componentWillUnmount() {
    this.authUnsubscribe();

    this.unsubscribe();
  }

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
        },
      });
    });
    this.setState({
      messages,
    });
  };

  addMessage() {
    const message = this.state.messages[0];
    // add the new messages to the collection
    this.referenceChatMessages.add({
      uid: this.state.uid,
      _id: message._id,
      text: message.text,
      createdAt: message.createdAt,
      user: message.user,
    });
  }

  // Adds sent message onto to message array
  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessage();
      }
    )
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
          user={ this.state.user }
        />
        { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null }
      </View>
    );
  }
}