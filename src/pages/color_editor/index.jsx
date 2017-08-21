import React from "react"
import electron from "electron"
import lodash from "lodash"

import {Link} from "react-router-dom"
import ReactTooltip from "react-tooltip"
import Slider from "rc-slider"
import css from "./style.css"
import "!style-loader!css-loader!rc-slider/assets/index.css"

export default class ColorEditorPage extends React.Component {

    componentDidMount() {
    }

    constructor(props) {
        super(props)
        this.state = {
            brightness: 90,
            saturation: 600,
            hue: 170
        }
    }

    render() {
        return (
            <div>
                Color Editor
                <hr />
                Hue <Slider min={0} max={359} defaultValue={170} onChange={value => this.setState({hue: value})} />
                Saturation <Slider min={0} max={1000} defaultValue={600} onChange={value => this.setState({saturation: value})} />
                Brightness <Slider min={0} max={100} defaultValue={90} onChange={value => this.setState({brightness: value})} />
                <div className={css.code}>
                    hue: {this.state.hue}<br />
                    saturation: {this.state.saturation}<br />
                    brightness: {this.state.brightness}
                    <img className={css.prizeIcon} src={require("../../res/images/prizes/generic.png")} style={{
                        filter: `brightness(${this.state.brightness || 90}%) sepia(100%) saturate(${this.state.saturation || 600}%) hue-rotate(${this.state.hue || 170}deg)`
                    }} />
                </div>
            </div>
        )
    }

}
