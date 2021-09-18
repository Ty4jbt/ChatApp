import React from 'react';
import { View, Text } from 'react-native';

export default class Chat extends React.Component {
  render() {
    const { name, color } = this.props.route.params;

    // Populate user's name, if entered
    this.props.navigation.setOptions({ title: name });

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: color,
        }}
      >
        <Text>Welcome to the Chat screen</Text>
      </View>
    );
  }
}