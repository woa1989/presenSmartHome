import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image
} from 'react-native';
import { Helper } from "../Helper";
import _ from "lodash";
import { Slider, Modal } from "@ant-design/react-native";
import CheckBox from 'react-native-check-box'
import { Tme, Colors } from "../ThemeStyle"

export default class DeviceSelectorTargetCamera extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      delay: this.props.target.delay || "0",
      delay_value: this.props.target.delay || "0",
      modalVisible: false,
      checked: this.props.target.checked
    }
  }

  componentDidMount() {

  }

  render() {
    return (
      <View style={{ paddingHorizontal: 8 }}>
        <View style={{
          backgroundColor: Tme("cardColor"),
        }}>
          <View style={{ padding: 10 }}>
            <View style={{ marginBottom: 20, marginTop: 16 }}>
              <CheckBox
                rightTextStyle={{ fontWeight: "300", fontSize: 16, color: Tme("cardTextColor") }}
                onClick={() => this.onClick()}
                rightText={Helper.i(this.props.spec.name)}
                isChecked={this.state.checked}
                checkedImage={<Image source={require("../../img/checkbox-checked.png")}
                  style={{ width: 17, height: 17, }} />}
                unCheckedImage={<Image source={require("../../img/Checkbox.png")}
                  style={{ width: 17, height: 17 }} />}
              />
            </View>
            <View style={{ marginTop: 0 }}>
              <Text style={{ color: Tme("textColor") }}>{this.props.spec.screenshot_url}</Text>
            </View>
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontWeight: "300", fontSize: 14, color: Tme("cardTextColor") }} >Delay(s)</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={this.delay.bind(this)}
                style={[styles.account_view, { borderColor: Tme("inputBorderColor") }]}>
                <Text
                  style={{
                    lineHeight: 40,
                    height: 40,
                    marginLeft: 6,
                    marginRight: 6,
                    color: Tme("placeholder"),
                  }}>{this.state.delay}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Modal
          title="Delay"
          transparent
          onClose={this.closeModal.bind(this)}
          visible={this.state.modalVisible}
          footer={[
            { text: "Cancel", onPress: () => console.log('cancel') },
            {
              text: "Confirm", onPress: () => {
                var value = this.state.delay_value
                if (this.state.delay_value == "") {
                  value = 0
                }
                this.setState({
                  delay: value
                }, () => {
                  this.save()
                })
              }
            },
          ]}
          style={{
            bottom: 100,
            backgroundColor: Tme("bgColor")
          }}
        >
          <View style={{
            padding: 3,
            borderColor: Tme("inputBorderColor"),
            borderWidth: 1,
            borderRadius: 3,
            marginTop: 8,
          }}>
            <TextInput
              autoFocus={true}
              autoCapitalize="none"
              underlineColorAndroid="transparent"
              autoCorrect={false}
              keyboardType="number-pad"
              returnKeyType="go"
              value={this.state.delay_value == "0" ? "" : (this.state.delay_value).toString()}
              onChangeText={(name) => this.setState({
                delay_value: name
              })}
              placeholderTextColor={Tme("placeholder")}
              style={Colors.TextInputStyle()}
            />
          </View>
        </Modal>
      </View>
    );
  }
  closeModal() {
    this.setState({
      modalVisible: false
    })
  }

  delay() {
    this.setState({
      modalVisible: true
    })
  }

  onClick() {
    if (this.state.checked == true) {
      this.setState({
        checked: false
      }, () => {
        this.props.target.checked = false
      })
    } else {
      this.save()
    }
  }

  save() {
    this.setState({
      checked: true
    })
    this.props.target.node_id = this.props.spec.device_id;
    this.props.target.instance_id = this.props.spec.instance_id;
    this.props.target.value_id = this.props.spec.value_id;
    this.props.target.spec_name = this.props.spec.name;
    this.props.target.target_type = "camera";
    this.props.target.commands = []
    this.props.target.delay = this.state.delay
    this.props.target.checked = true
    this.props.spec_settings.targets.push(this.props.target)
  }

}
const styles = StyleSheet.create({
  account_view: {
    padding: 3,
    borderWidth: 1,
    borderRadius: 3,
    marginTop: 16,
    marginBottom: 20
  },
});