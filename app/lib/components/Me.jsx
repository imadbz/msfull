import React from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import ReactTooltip from "react-tooltip"
import classnames from "classnames"
import * as cookiesManager from "../cookiesManager"
import * as appPropTypes from "./appPropTypes"
import { withRoomContext } from "../RoomContext"
import * as stateActions from "../redux/stateActions"
import PeerView from "./PeerView"

class Me extends React.Component {
  constructor(props) {
    super(props)

    this._mounted = false
    this._rootNode = null
  }

  render() {
    const { roomClient, connected, me, audioProducer, videoProducer, videoProducers, faceDetection, onSetStatsPeerId } = this.props

    let micState

    if (!me.canSendMic) micState = "unsupported"
    else if (!audioProducer) micState = "unsupported"
    else if (!audioProducer.paused) micState = "on"
    else micState = "off"

    let webcamState

    if (!me.canSendWebcam) webcamState = "unsupported"
    else if (!videoProducer) webcamState = "unsupported"
    else if (!videoProducer.paused) webcamState = "on"
    else webcamState = "off"

    let changeWebcamState = "on"

    // if (Boolean(videoProducer) && videoProducer.type !== "share" && me.canChangeWebcam) changeWebcamState = "on"
    // else changeWebcamState = "unsupported"

    let shareState = "off"

    // if (Boolean(videoProducer) && videoProducer.type === "share") shareState = "on"
    // else shareState = "off"

    const videoVisible = true //Boolean(videoProducer) && !videoProducer.paused

    let tip

    if (!me.displayNameSet) tip = "Click on your name to change it"

    return (
      <div data-component="Me" ref={(node) => (this._rootNode = node)} data-tip={tip} data-tip-disable={!tip}>
        <If condition={connected}>
          <div className="controls">
            {/* <div
              className={classnames("button", "mic", micState)}
              onClick={() => {
                micState === "on" ? roomClient.muteMic() : roomClient.unmuteMic()
              }}
            />

            <div
              className={classnames("button", "webcam", webcamState, {
                disabled: me.webcamInProgress || me.shareInProgress,
              })}
              onClick={() => {
                if (webcamState === "on") {
                  cookiesManager.setDevices({ webcamEnabled: false })
                  roomClient.disableWebcam()
                } else {
                  cookiesManager.setDevices({ webcamEnabled: true })
                  roomClient.enableWebcam()
                }
              }}
            /> */}

            {/* <div
              className={classnames("button", "change-webcam", changeWebcamState, {
                disabled: me.webcamInProgress || me.shareInProgress,
              })}
              onClick={() => roomClient.changeWebcam()}
            /> */}

            <div
              className={classnames("button", "share", shareState, {
                disabled: me.shareInProgress || me.webcamInProgress,
              })}
              onClick={() => {
                if (shareState === "on") roomClient.disableShare()
                else roomClient.enableShare()
              }}
            />
          </div>
        </If>

        {videoProducers.map((videoProducer) => (
          <div style={{ position: "relative" }}>
            <div className={"controls lower"}>
              <div
                className={classnames("button", "pause-webcam", "on")}
                onClick={() => (videoProducer.paused ? roomClient.resumeProducer(videoProducer) : roomClient.pauseProducer(videoProducer))}
              />
            </div>
            <PeerView
              isMe
              peer={me}
              audioProducerId={audioProducer ? audioProducer.id : null}
              videoProducerId={videoProducer ? videoProducer.id : null}
              audioRtpParameters={audioProducer ? audioProducer.rtpParameters : null}
              videoRtpParameters={videoProducer ? videoProducer.rtpParameters : null}
              audioTrack={audioProducer ? audioProducer.track : null}
              videoTrack={videoProducer ? videoProducer.track : null}
              videoVisible={videoVisible}
              audioCodec={audioProducer ? audioProducer.codec : null}
              videoCodec={videoProducer ? videoProducer.codec : null}
              audioScore={audioProducer ? audioProducer.score : null}
              videoScore={videoProducer ? videoProducer.score : null}
              faceDetection={faceDetection}
              onChangeDisplayName={(displayName) => {
                roomClient.changeDisplayName(displayName)
              }}
              onChangeMaxSendingSpatialLayer={(spatialLayer) => {
                roomClient.setMaxSendingSpatialLayer(spatialLayer)
              }}
              onStatsClick={onSetStatsPeerId}
            />
          </div>
        ))}

        <ReactTooltip type="light" effect="solid" delayShow={100} delayHide={100} delayUpdate={50} />
      </div>
    )
  }

  componentDidMount() {
    this._mounted = true

    setTimeout(() => {
      if (!this._mounted || this.props.me.displayNameSet) return

      ReactTooltip.show(this._rootNode)
    }, 4000)
  }

  componentWillUnmount() {
    this._mounted = false
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.me.displayNameSet && this.props.me.displayNameSet) ReactTooltip.hide(this._rootNode)
  }
}

Me.propTypes = {
  roomClient: PropTypes.any.isRequired,
  connected: PropTypes.bool.isRequired,
  me: appPropTypes.Me.isRequired,
  audioProducer: appPropTypes.Producer,
  videoProducer: appPropTypes.Producer,
  faceDetection: PropTypes.bool.isRequired,
  onSetStatsPeerId: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => {
  const producersArray = Object.values(state.producers)
  console.log("state.producers", state.producers)

  const audioProducer = producersArray.find((producer) => producer.track.kind === "audio")
  const videoProducer = producersArray.find((producer) => producer.track.kind === "video")
  const videoProducers = producersArray.filter((producer) => producer.track.kind === "video")

  return {
    connected: state.room.state === "connected",
    me: state.me,
    audioProducer: audioProducer,
    videoProducer: videoProducer,
    videoProducers: videoProducers,
    faceDetection: state.room.faceDetection,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onSetStatsPeerId: (peerId) => dispatch(stateActions.setRoomStatsPeerId(peerId)),
  }
}

const MeContainer = withRoomContext(connect(mapStateToProps, mapDispatchToProps)(Me))

export default MeContainer
