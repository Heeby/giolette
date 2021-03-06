import React from "react"
import electron from "electron"
import lodash from "lodash"

import {Link} from "react-router-dom"
import css from "./style.css"

export default class ChatPrizesPage extends React.Component {

    componentDidMount() {
    }

    render() {
        const prizes = electron.remote.getGlobal("chatPrizes")

        return (
            <div>
                {prizes.length} Chat Prizes
                <hr />
                {prizes.map(prize =>
                    <div className={css.prize}>
                        <img className={css.prizeIcon} src={require(`../../res/images/prizes/${prize.icon || "generic"}.png`)} style={{
                            filter: `brightness(${prize.brightness || 90}%) sepia(100%) saturate(${prize.saturation || 600}%) hue-rotate(${prize.hue || 170}deg)`
                        }} />
                        <span>{prize.name}</span>
                        <span>{prize.weight} weight ({lodash.round(prize.weightNormalized * 100, 2)}%)</span>
                    </div>)}
            </div>
        )
    }

}
