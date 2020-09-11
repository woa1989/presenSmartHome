import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { Helper, DEVICE_WIDTH, HelperMemo } from "../Helper"
import {
  NotificationCenter,
  EVENT_GRPC_CONTROLLER_CHANGE,
} from "../NotificationCenter"
import _ from "lodash"
import { Navigation } from 'react-native-navigation';
import * as Progress from 'react-native-progress';
import GrpcManager from "../components/GrpcManager";
import { Tag, Provider } from "@ant-design/react-native"
import { Colors, Tme } from "../ThemeStyle";
import ILoading from '../components/ILoading';
import IdleTimerManager from 'react-native-idle-timer';
import DeviceControl from "../components/DeviceControl";
import NavBarView from "../components/NavBarView";
import CardView from '../components/CardView';
import AppConfig from '../../AppConfig';

export default class AddDevice extends Component {

  constructor(props) {
    super(props);

    this.state = {
      progress: 0,
      indeterminate: true,
      time_show: true,
      input_value: "",
      input_show: false,
      text_show: false,
      wait: true,
      csa: "",
      dsk_text: "",
      countdown: 60,
      countdownShow: true
    };
    this.key = null
    this.down = null
    this.alertd = false
  }

  countdown() {
    var time = 60
    this.down = setInterval(() => {
      if (this.state.countdown > 0) {
        this.setState({
          countdown: time--,
        })
      } else {
        this.clearCountdown()
        Alert.alert("", "Operation timeout, please try again!", [
          {
            text: "Confirm", onPress: () => {
              Navigation.pop(this.props.componentId)
            }
          },
        ]);
      }
    }, 1000)
  }

  clearCountdown() {
    if (this.down) {
      clearInterval(this.down)
    }
    this.down = null
  }

  componentDidMount() {
    var _this = this;

    _this.setState({
      show_view: true,
    }, () => {
      _this.grpcManager = new GrpcManager({
        onConnect: _this.onConnect.bind(this)
      });
      _this.grpcManager.mount();
    });

    NotificationCenter.addObserver(this, EVENT_GRPC_CONTROLLER_CHANGE, (payload) => {
      var _this = this;
      if (payload.queue == "controller") {
        switch (payload.data.op_state) {
          case "csa":
            _this.setState({
              time_show: false,
              text_show: true,
              csa: payload.data.csa
            })
            break;
          case "dsk":
            _this.setState({
              time_show: false,
              wait: true,
              input_show: true,
              dsk_text: payload.data.dsk
            })
            break;
          case "dsk_invalid":
            _this.refs.ai.hide()
            _this.setState({
              time_show: false,
              wait: true,
              input_show: true,
              input_value: ""
            }, () => {
              Alert.alert("Error", "Device key is invalid")
            })
            break;
          case "starting":
            _this.setState({
              time_show: true,
              countdownShow: true,
              wait: false,
              indeterminate: false,
            }, () => {
              _this.countdown()
            })
            break;
          case "in_progress":
            _this.refs.ai.hide()
            _this.setState({
              progress: 0.25,
              wait: true,
              countdownShow: false,
              time_show: true,
              input_show: false,
              text_show: false
            }, () => {
              _this.clearCountdown()
            })
            break;
          case "in_progress_1":
            _this.refs.ai.hide()
            _this.setState({
              progress: 0.5,
              wait: true,
              time_show: true,
              countdownShow: false,
              input_show: false,
              text_show: false
            }, () => {
              _this.clearCountdown()
            })
            break;
          case "in_progress_2":
            _this.refs.ai.hide()
            _this.setState({
              progress: 0.75,
              wait: true,
              time_show: true,
              countdownShow: false,
              input_show: false,
              text_show: false
            }, () => {
              _this.clearCountdown()
            })
            break;
          case "device_added":
            _this.refs.ai.hide()
            _this.setState({
              progress: 1,
              wait: true,
              time_show: true,
              countdownShow: false,
              input_show: false,
              text_show: false
            }, () => {
              _this.clearCountdown()
              Alert.alert(
                "Add Device",
                "Success",
                [
                  {
                    text: 'OK', onPress: () => {
                      Navigation.push(_this.props.componentId, {
                        component: {
                          name: "AddSuccess",
                          passProps: {
                            uuid: payload.data["devices"][0].index,
                            type: "new"
                          },
                          options: {
                            popGesture: false,
                            topBar: {
                              backButton: {
                                visible: false,
                              },
                              title: {
                                text: "",
                              }
                            },
                          }
                        }
                      })
                    }
                  },
                ],
                { cancelable: false },
              );
            })
            break;
          case "failed":
            _this.setState({
              indeterminate: true,
              countdownShow: false,
              progress: 0
            }, () => {
              if (!_this.alertd) {
                _this.alertd = true
                Alert.alert(
                  "Add Device",
                  "Failed",
                  [
                    {
                      text: 'OK', onPress: () => {
                        Navigation.pop(_this.props.componentId)
                      }
                    },
                  ],
                  { cancelable: false },
                );
              }
            })
            break;
          default:
            break;
        }
      }
    })

    IdleTimerManager.setIdleTimerDisabled(true);
  }

  onConnect() {
    new DeviceControl({ type: this.props.type, sn_id: AppConfig.sn_id }).addDevice()
  }

  componentWillUnmount() {
    if (this.grpcManager) {
      this.grpcManager.unmount();
    }
    if (this.down) {
      clearTimeout(this.down);
      this.down = null;
    }
    new DeviceControl({ type: this.props.type }).CmdStop()
    NotificationCenter.removeObserver(this, EVENT_GRPC_CONTROLLER_CHANGE)
    IdleTimerManager.setIdleTimerDisabled(false);
  }

  render() {
    var _this = this;

    return (
      <Provider>
        <NavBarView>
          <KeyboardAvoidingView
            behavior="padding"
            enabled
            style={{
              flex: 1,
              backgroundColor: Tme("bgColor"),
              alignItems: "center",
            }}>
            <ILoading ref='ai' hide={true} />
            <CardView
              styles={{
                marginTop: 40,
                width: DEVICE_WIDTH - 40,
                height: HelperMemo.WiNDOW_HEIGHT - 80,
                padding: 20,
                alignItems: "center",
                borderRadius: 8,
              }}
            >
              <View style={{ marginTop: 79, marginBottom: 20 }}>
                <Text style={{ fontSize: 22, fontWeight: "600", textAlign: "center", color: Tme("cardTextColor") }}>
                  Add Device
                </Text>
                {this.state.wait ?
                  <View style={{ padding: 16 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", textAlign: "center", color: Tme("cardTextColor") }}>
                      Please wait
                    </Text>
                  </View>
                  : <View style={{ padding: 16 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", textAlign: "center", color: Tme("cardTextColor") }}>
                      Please press buttons on the device following the device manual to add the device
                    </Text>
                  </View>}
                {this.state.input_show ?
                  <View style={{ padding: 16 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", textAlign: "center", color: Tme("cardTextColor") }}>
                      Please input the first five digits of the device key, you can refer to the deivce manual to get the device key
                    </Text>
                  </View>
                  : null}
              </View>
              <View>
                {this.state.time_show ?
                  this.state.countdownShow ?
                    <Progress.Circle
                      size={140}
                      progress={this.state.progress}
                      indeterminate={this.state.indeterminate}
                      showsText={true}
                      color={Colors.MainColor}
                      formatText={(progress) => {
                        return (`${_this.state.countdown}`)
                      }}
                    />
                    :
                    <Progress.Circle
                      size={140}
                      color={Colors.MainColor}
                      progress={this.state.progress}
                      indeterminate={this.state.indeterminate}
                      showsText={true}
                    />
                  : null}
                <View>
                  {this.state.input_show ?
                    <View>
                      <View style={[styles.account_view, { borderColor: Tme("inputBorderColor"), }]}>
                        <TextInput
                          ref='room'
                          autoCapitalize="none"
                          placeholder="DSK"
                          keyboardType="number-pad"
                          autoCorrect={false}
                          underlineColorAndroid="transparent"
                          value={this.state.input_value}
                          onChangeText={(input_value) => this.setState({ input_value })}
                          style={Colors.TextInputStyle()}
                          placeholderTextColor={Tme("placeholder")}
                        />
                      </View>
                      <View style={{ marginTop: 16 }}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={{
                            height: 40,
                            backgroundColor: Colors.MainColor,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                          onPress={this._save.bind(this)}>
                          <Text style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "#ffffff",
                            width: DEVICE_WIDTH / 4 * 3 - 60,
                            textAlign: "center"
                          }}>Save</Text>
                        </TouchableOpacity>
                      </View>
                      <Tag>{this.state.dsk_text}</Tag>
                    </View> : null
                  }
                  {this.state.text_show ? <View>
                    <Tag>{this.state.csa}</Tag>
                  </View> : null
                  }
                </View>
              </View>
              <View style={{ marginTop: 40, alignItems: "center", marginBottom: 30 }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={this.close.bind(this)}
                  style={{
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: Colors.MainColor,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#ffffff",
                    width: 120,
                    textAlign: "center"
                  }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </CardView>
          </KeyboardAvoidingView>
        </NavBarView>
      </Provider>
    )
  }

  _save() {
    new DeviceControl({ sn_id: AppConfig.sn_id, value: this.state.input_value, dskText: this.state.dsk_text }).setDsk()
    this.refs.ai.show()
  }

  close() {
    if (this.state.input_show) {
      this.setState({
        input_show: false,
        time_show: true,
      })
    } else {
      Navigation.pop(this.props.componentId)
    }
  }
}
const styles = StyleSheet.create({
  account_view: {
    padding: 3,
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 3,
  },
});
