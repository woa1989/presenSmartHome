import React, { Component } from 'react';
import {
  View,
  Text,
} from 'react-native';
import { Helper, DEVICE_WIDTH } from '../Helper';
import _ from "lodash";
import { Colors, Tme } from "../ThemeStyle";
import CardView from "../components/CardView";
import MCIcons from "react-native-vector-icons/MaterialCommunityIcons"
import SwitchBtn from '../components/SwitchBtn';
import memoizeOne from 'memoize-one';
import DeviceControl from "../components/DeviceControl";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Router } from "../components/Router";

export default class DeviceList extends Component {

  constructor(props) {
    super(props);
  }

  getIcon = memoizeOne((propsDevice) => {
    return Helper.getDeviceIcon(propsDevice);
  })

  hasSwitch = memoizeOne((propsDevice) => {
    var spec = Helper.getOneSwitchSpec(propsDevice)
    if (spec) {
      return spec
    } else {
      return null
    }
  })

  render() {
    var { item } = this.props;
    var icon = this.getIcon(this.props.item.device);
    var switchSpec = this.hasSwitch(this.props.item.device);
    return (
      <CardView
        withWaveBg={true}
        onChange={this.deviceShow.bind(this, item)}
        styles={{
          height: 150,
          padding: 20,
          marginBottom: 10,
          marginTop: 20,
        }}>
        <View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}>
          <MCIcons size={35} color={Tme("cardTextColor")} name={icon} />
          {switchSpec ?
            <SwitchBtn
              key={Math.random()}
              cusStyle={{ marginRight: -3 }}
              value={_.toInteger(switchSpec.real_value) > 0}
              change={this.change.bind(this, switchSpec)} />
            : null}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, justifyContent: "space-between" }}>
          <Text
            numberOfLines={2}
            style={[{
              color: Tme("cardTextColor"),
              fontSize: 16,
              fontWeight: "500",
            }, { width: DEVICE_WIDTH / 2 - 60 - 22 }]}>
            {item.name}</Text>
          {item.is_alive ?
            null
            : <Ionicons name="ios-information-circle-outline" size={22} color="#fc577acc" />}
        </View>
      </CardView>);
  }

  change(switchSpec, e) {
    var sn_id = this.props.item.device.sn_id
    var param = e ? 255 : 0
    var deviceControl = new DeviceControl({ spec: switchSpec, sn_id: sn_id, param: param, successCb: false, runCMD: true })
    deviceControl.switch();
  }

  deviceShow(item) {
    Router.pushDeviceShow(this.props.componentId, { data: item })
  }

}