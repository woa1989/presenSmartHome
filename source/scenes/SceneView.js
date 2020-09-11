import React, { Component } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { DEVICE_HEIGHT, DEVICE_WIDTH, Helper } from "../Helper"
import ILoading from '../components/ILoading';
import { observer } from 'mobx-react';
import SelectDevice from "../select_device_spec/SelectDevice"
import _ from "lodash";
import Scene from "../models/Scene";
import Device from "../models/Device";
import { Navigation } from 'react-native-navigation';
import { NotificationCenter, EVENT_SCENE } from "../NotificationCenter"
import { Provider } from "@ant-design/react-native"
import { Colors, Tme } from "../ThemeStyle";
import NavBarView from "../components/NavBarView";
import { toJS } from 'mobx';

@observer
export default class SceneView extends Component {
  static options(passProps) {
    return {
      topBar: {
        rightButtons: [
          {
            id: 'save',
            text: "save",
            color: Colors.MainColor
          }
        ]
      }
    };
  }

  scene = new Scene();
  device = new Device();
  constructor(props) {
    super(props);

    this.state = {
      targets: [],
      view_show: false,
      rooms: [],
    }
  }

  componentDidMount() {
    this.doFatchData()
    this.scene.is_system = this.props.system
    this.scene.name = this.props.name
    Navigation.events().bindComponent(this);
  }
  navigationButtonPressed({ buttonId }) {
    if (buttonId == "save") {
      var _this = this;
      if (this.scene.name == undefined) {
        Alert.alert(
          "Name can not be empty!",
        )
      } else {
        if (this.scene.name != "") {
          _this.refs.ai.show();
          var targets = _.groupBy(this.scene.targets, "checked")["true"]
          if (targets == undefined) {
            targets = []
          } else {
            var temp = []
            _.forEach(targets, function (v, k) {
              temp.push(toJS(v))
            })
            targets = temp
          }
          Helper.sendRequest("post", "/scenes", {
            name: this.scene.name,
            uuid: this.props.uuid,
            targets: targets
          }, {
            ensure: () => {
              _this.refs.ai.hide();
            },
            success: (data) => {
              NotificationCenter.dispatchEvent(EVENT_SCENE);
              Navigation.dismissModal(_this.props.componentId);
              Alert.alert(
                "Scenes",
                "Successful"
              );
            },
            error: (data) => {
              Alert.alert(_.uniq(data).join("\n"))
            }
          })
        } else {
          Alert.alert(
            "Scene",
            "Name can not be empty!"
          )
        }
      }
    } else if (buttonId == "close") {
      Navigation.dismissModal(this.props.componentId);
    }
  }

  doFatchData() {
    var _this = this;
    this.refs.ai.show();
    Helper.sendRequest("get", "/scenes/data", { uuid: this.props.uuid }, {
      success: (data) => {
        if (data.scene.length > 0) {
          if (data.scene[0].targets) {
            this.scene.spec_targets(data.scene[0].targets)
          }
        }
        var devices = []
        _.forEach(data.devices, function (v, k) {
          if (v.index != 1) {
            devices.push(v)
          }
        })

        this.device.devices = devices
        this.setState({
          rooms: data.rooms,
          view_show: true
        })
      },
      ensure: () => {
        _this.refs.ai.hide();
      }
    })
  }
  render() {
    return (
      <Provider>
        <ILoading ref='ai' hide={true} />
        <NavBarView>
          {this.state.view_show ?
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode='interactive'
            >
              <View style={{
                backgroundColor: Tme("bgColor"),
                marginTop: 20,
              }}>
                <View style={{
                  backgroundColor: Tme("cardColor"),
                  paddingHorizontal: 20
                }}>
                  <View style={[styles.account_view, {
                    borderColor: Tme("inputBorderColor"),
                  }]}>
                    <TextInput
                      placeholderTextColor={Tme("placeholder")}
                      style={Colors.TextInputStyle()}
                      autoCapitalize="none"
                      editable={!this.scene.is_system}
                      underlineColorAndroid="transparent"
                      placeholder="Scene name"
                      value={this.scene.name}
                      onChangeText={(name) => { this.scene.name = name }}
                    />
                  </View>
                </View>
              </View>
              <SelectDevice
                rooms={this.state.rooms} product="scene"
                spec_settings={this.scene}
                device={this.device} componentId={this.props.componentId} type="target" />
            </ScrollView>
            : null}
        </NavBarView>
      </Provider>
    )
  }

}
const styles = StyleSheet.create({
  account_view: {
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 3,
    marginBottom: 20,
    marginTop: 16,
  },
});

