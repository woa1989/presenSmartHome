import React, { Component } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { Tme, Colors } from "../ThemeStyle";
import { Helper, DEVICE_WIDTH } from "../Helper";
import _ from "lodash";
import { Navigation } from 'react-native-navigation';
import {
  NotificationCenter,
  D433_SELECT_DEVICE,
  D433_SELECT_TYPE,
} from "../NotificationCenter"
import NavBarView from "../components/NavBarView";
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import DeviceControl from "../components/DeviceControl";
import AppConfig from "../../AppConfig";

export default class Add433Device extends Component {
  static options(passProps) {
    return {
      topBar: {
        rightButtons: [
          {
            id: 'save',
            text: "Save",
            color: Colors.MainColor
          }
        ]
      }
    };
  }
  constructor(props) {
    super(props);

    this.timer = null;

    this.state = {
      start_learn: true,
      current_selected_device: null,
      current_selected_node_type: null,
      current_device_protocol: null,

      detected: null,
      selected_devices: [],
    }
  }

  componentDidMount() {
    var _this = this;
    NotificationCenter.addObserver(this, D433_SELECT_DEVICE, (data) => {
      _this.setState({
        current_device_protocol: data.prot,
        current_selected_device: data.device,
        detected: data.detected
      })
    })
    NotificationCenter.addObserver(this, D433_SELECT_TYPE, (type) => {
      _this.setState({
        current_selected_node_type: type,
      })
    })
    Navigation.events().bindComponent(this);
  }

  componentWillUnmount() {
    NotificationCenter.removeObserver(this, D433_SELECT_DEVICE)
    NotificationCenter.removeObserver(this, D433_SELECT_TYPE)
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId == "save") {
      var _this = this;
      var data = []
      if (!this.state.current_selected_device) {
        Alert.alert("Please select device")
      }

      if (!this.state.current_selected_node_type) {
        Alert.alert("Please select the device type for this device")
      } else {
        data.push({
          index: this.state.current_selected_device,
          node_type: this.state.current_selected_node_type,
        })
        Helper.sendRequest("post", "/partner/ftt/add_device", {
          selected_devices: data,
          port_id: this.state.detected.port.port_id,
        }, {
          success: (data) => {
            new DeviceControl({ param: _this.state.detected.port.port_id, sn_id: AppConfig.sn_id, successCb: false }).end_learn()
            Navigation.pop(this.props.componentId)
          }
        })
      }
    }
  }

  render() {
    return (
      <NavBarView>
        <View style={{ height: 20 }}></View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={this.click.bind(this, "device")}
          style={{ backgroundColor: Tme("cardColor"), }}>
          <View style={{
            marginLeft: 18,
            marginRight: 20,
            flexDirection: "row",
            paddingVertical: 16,
            justifyContent: "space-between",
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: Tme("cardTextColor") }}>Devices</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: Tme("cardTextColor") }}>{this.state.current_selected_device}</Text>
              <MaterialIcons name="keyboard-arrow-right" size={20} color={Tme("textColor")} />
            </View>
          </View>
        </TouchableOpacity>
        <View style={{ height: 2 }}></View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={this.click.bind(this, "type")}
          style={{ backgroundColor: Tme("cardColor"), }}>
          <View style={{
            marginLeft: 18,
            marginRight: 20,
            flexDirection: "row",
            paddingVertical: 16,
            justifyContent: "space-between",
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: Tme("cardTextColor") }}>Type</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: Tme("cardTextColor") }}>{this.state.current_selected_node_type}</Text>
              <MaterialIcons name="keyboard-arrow-right" size={20} color={Tme("textColor")} />
            </View>
          </View>
        </TouchableOpacity>
      </NavBarView>
    )
  }

  click(type) {
    if (type === "device") {
      Navigation.push(this.props.componentId, {
        component: {
          name: "DeviceList",
          options: {
            animations: {
              push: {
                animate: true,
              }
            },
            topBar: {
              elevation: 0,
              title: {
                text: "Device",
              },
            },
            bottomTabs: {
              visible: false,
              animate: true,
              drawBehind: true
            }
          }
        }
      })
    } else {
      if (this.state.current_device_protocol) {
        var opts = []
        this.state.current_device_protocol.node_types.map((v, k) => {
          opts.push({ label: v, value: v })
        });
        Navigation.push(this.props.componentId, {
          component: {
            name: "DeviceType",
            passProps: {
              types: opts
            },
            options: {
              animations: {
                push: {
                  animate: true,
                }
              },
              topBar: {
                elevation: 0,
                title: {
                  text: "Please select the device type for this device",
                },
              },
              bottomTabs: {
                visible: false,
                animate: true,
                drawBehind: true
              }
            }
          }
        })
      } else {
        Alert.alert("Please select one device at least!")
      }
    }
  }
}