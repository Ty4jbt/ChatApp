import React from 'react';
import { View, KeyboardAvoidingView, LogBox } from 'react-native';
import CustomActions from './CustomActions';

// Gifted Chat
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';

// Firebase
import firebase from "firebase";
import("firebase/firestore");

//Async Storage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Netinfo
import NetInfo from '@react-native-community/netinfo';

// Mapview to view location that was sent
import MapView from 'react-native-maps';

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
      },
      isConnected: false,
    }

    if (!firebase.apps.length){
      firebase.initializeApp(firebaseConfig);
    }
    
    // Allows you to refence firestore data
    this.referenceChatMessages = firebase.firestore().collection("messages");

    LogBox.ignoreAllLogs();
  }

  // sets default message set opening
  componentDidMount() {
    const name = this.props.route.params.name;

     // Check if user is online or offline
     NetInfo.fetch().then(connection => { 
      if (connection.isConnected) {
        this.setState({ isConnected: true });
        console.log('online');
    
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
      } else {
        console.log('offline');
        this.setState({ isConnected: false })
        // Calls messeages from offline storage
        this.getMessages();
      }
    });
  }

  // Stops updating
  componentWillUnmount() {
    this.authUnsubscribe();
  }

  //Loads messages from AsyncStorage
  async getMessages() {
    let messages = '';
    try {
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  async saveMessages() {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  };

  async deleteMessages() {
    try {
      await AsyncStorage.removeItem('messages');
      this.setState({
        messages: []
      })
    } catch (error) {
      console.log(error.message);
    }
  };

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
        image: data.image || null,
        location: data.location || null
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
      text: message.text || '',
      createdAt: message.createdAt,
      user: message.user,
      image: message.image || null,
      location: message.location || null
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

        this.saveMessages();
      }
    )
  }

  // Renders Custom Actions
  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  //If offline, dont render the input toolbar
  renderInputToolbar(props) {  
    if (this.state.isConnected === false) {
    } else {
      return(
        <InputToolbar
        {...props}
        />
      );
    }
  }

 // Function to render the Custom View, which will be used to display the location map
  renderCustomView = (props) => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
          <MapView
              style={{
                  width: 150,
                  height: 100,
                  borderRadius: 13,
                  margin: 3
              }}
              region={{
                  latitude: currentMessage.location.latitude,
                  longitude: currentMessage.location.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
              }}
          />
      );
    }
    return null;
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
          renderCustomView={this.renderCustomView}
          renderActions={this.renderCustomActions}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
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