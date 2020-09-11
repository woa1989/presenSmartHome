import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import _ from 'lodash';
import { Helper, HelperMemo } from '../Helper';
import { Colors, Tme } from '../ThemeStyle';
import CardView from "../components/CardView";

export default class HomeScreen extends Component {
  static options(passProps) {
    return {
      topBar: {
        visible: false,
        noBorder: true,
        elevation: 0,
      },
    };
  }
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    this.doFetchData();
  }

  doFetchData() {
    var _this = this;
    Helper.sendRequest('get', '/controllers', '', {
      success: (data) => {
        _this.setState({
          data: data.controllers,
        });
        HelperMemo.sn_tags = data.controllers[0].tags.splice(',');
      },
    });
  }
  showActionSheet() {
    const BUTTONS = [
      'Operation1',
      'Operation2',
      'Operation3',
      'Delete',
      'Cancel',
    ];
    ActionSheet.showActionSheetWithOptions(
      {
        title: 'Title',
        message: 'Description',
        options: BUTTONS,
        cancelButtonIndex: 4,
        destructiveButtonIndex: 3,
      },
      buttonIndex => {
        this.setState({ clicked: BUTTONS[buttonIndex] });
      }
    );
  };

  render() {
    var html = [];
    _.each(this.state.data, (v, k) => {
      html.push(
        <CardView
          key={k}
          withWaveBg={true}
          styles={{
            padding: 20,
            marginBottom: 10,
            flex: 1,
            height: 200
          }}>
          <Text style={styles.text}>id: {v.id}</Text>
          <Text style={styles.text}>sn: {v.sn}</Text>
          <Text style={styles.text}>version: {v.ctl_version}</Text>
          <Text style={styles.text}>tags: {v.tags.join(',')}</Text>
          <Text style={styles.text}>isOnline: {v.is_online}</Text>
        </CardView>
      );
    });

    return (
      <View style={{ flex: 1 }}>
        <View style={{ height: HelperMemo.STATUS_BAR_HEIGHT }} />
        <View
          style={{
            height: HelperMemo.NAV_BAR_HEIGHT,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'white',
            paddingHorizontal: 20,
          }}>
          <Text
            style={{ color: Colors.MainColor, fontSize: 16, fontWeight: '600' }}>
            Home
          </Text>
        </View>
        <View
          style={{
            backgroundColor: Tme('bgColor'),
            flex: 1,
            flexDirection: "row",
            padding: 20,
          }}>
          {html}
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  row: {
    backgroundColor: Colors.MainColor,
    padding: 20,
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
    lineHeight: 30,
  },
});
