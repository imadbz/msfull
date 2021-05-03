import React, { useCallback, useState } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import * as appPropTypes from "./appPropTypes"
import { withRoomContext } from "../RoomContext"
import * as stateActions from "../redux/stateActions"
import PeerView from "./PeerView"
import classnames from "classnames"
import { useHotkeys } from "react-hotkeys-hook"

const Peer = (props) => {
  const { roomClient, peer, audioConsumer, videoConsumers, audioMuted, faceDetection, onSetStatsPeerId } = props

  const [activeVideoSource, setActiveVideoSource] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useHotkeys("c", () => {
    setActiveVideoSource((c) => c + 1)
  })

  console.log("videoConsumers", videoConsumers, activeVideoSource)

  if (
    activeVideoSource !== 0 &&
    (activeVideoSource >= videoConsumers.length || !videoConsumers[activeVideoSource] || videoConsumers[activeVideoSource].remotelyPaused)
  ) {
    setActiveVideoSource(0)
  }

  const activeVideoConsumer = videoConsumers.find((consumer) => consumer.id === videoConsumers[activeVideoSource]?.id)

  const audioEnabled = Boolean(audioConsumer) && !audioConsumer.locallyPaused && !audioConsumer.remotelyPaused

  const activeVideoEnabled = Boolean(activeVideoConsumer) && !activeVideoConsumer.remotelyPaused

  const activeVideoVisible = activeVideoEnabled && !activeVideoConsumer.locallyPaused

  return (
    <div data-component="Peer">
      <div className="indicators">
        <If condition={!audioEnabled}>
          <div className="icon mic-off" />
        </If>

        <If condition={!activeVideoConsumer}>
          <div className="icon webcam-off" />
        </If>
      </div>

      <div className={"peer-content"}>
        <div className={"peers-sidebar" + (sidebarOpen ? " fullWidth" : " sided")}>
          {!sidebarOpen && (
            <button
              onClick={() => {
                setSidebarOpen(!sidebarOpen)
              }}
            >
              FullScreen
            </button>
          )}
          {videoConsumers.map((videoConsumer, index) => {
            const videoEnabled = Boolean(videoConsumer) && !videoConsumer.remotelyPaused

            const videoVisible = videoEnabled && !videoConsumer.locallyPaused

            return (
              videoEnabled && (
                <div
                  key={videoConsumer.id}
                  style={{ position: "relative" }}
                  onClick={() => {
                    setActiveVideoSource(index)
                    setSidebarOpen(false)
                  }}
                >
                  <PeerView
                    peer={peer}
                    audioConsumerId={audioConsumer ? audioConsumer.id : null}
                    videoConsumerId={videoConsumer ? videoConsumer.id : null}
                    audioRtpParameters={audioConsumer ? audioConsumer.rtpParameters : null}
                    videoRtpParameters={videoConsumer ? videoConsumer.rtpParameters : null}
                    consumerSpatialLayers={videoConsumer ? videoConsumer.spatialLayers : null}
                    consumerTemporalLayers={videoConsumer ? videoConsumer.temporalLayers : null}
                    consumerCurrentSpatialLayer={videoConsumer ? videoConsumer.currentSpatialLayer : null}
                    consumerCurrentTemporalLayer={videoConsumer ? videoConsumer.currentTemporalLayer : null}
                    consumerPreferredSpatialLayer={videoConsumer ? videoConsumer.preferredSpatialLayer : null}
                    consumerPreferredTemporalLayer={videoConsumer ? videoConsumer.preferredTemporalLayer : null}
                    consumerPriority={videoConsumer ? videoConsumer.priority : null}
                    audioTrack={audioConsumer ? audioConsumer.track : null}
                    videoTrack={videoConsumer ? videoConsumer.track : null}
                    audioMuted={audioMuted}
                    videoVisible={videoVisible}
                    videoMultiLayer={videoConsumer && videoConsumer.type !== "simple"}
                    audioCodec={audioConsumer ? audioConsumer.codec : null}
                    videoCodec={videoConsumer ? videoConsumer.codec : null}
                    audioScore={audioConsumer ? audioConsumer.score : null}
                    videoScore={videoConsumer ? videoConsumer.score : null}
                    faceDetection={faceDetection}
                    onChangeVideoPreferredLayers={(spatialLayer, temporalLayer) => {
                      roomClient.setConsumerPreferredLayers(videoConsumer.id, spatialLayer, temporalLayer)
                    }}
                    onChangeVideoPriority={(priority) => {
                      roomClient.setConsumerPriority(videoConsumer.id, priority)
                    }}
                    onRequestKeyFrame={() => {
                      roomClient.requestConsumerKeyFrame(videoConsumer.id)
                    }}
                    onStatsClick={onSetStatsPeerId}
                  />
                </div>
              )
            )
          })}
        </div>

        {!sidebarOpen && (
          <div className="peers-main">
            <div style={{ position: "relative" }}>
              <PeerView
                peer={peer}
                audioConsumerId={audioConsumer ? audioConsumer.id : null}
                videoConsumerId={activeVideoConsumer ? activeVideoConsumer.id : null}
                audioRtpParameters={audioConsumer ? audioConsumer.rtpParameters : null}
                videoRtpParameters={activeVideoConsumer ? activeVideoConsumer.rtpParameters : null}
                consumerSpatialLayers={activeVideoConsumer ? activeVideoConsumer.spatialLayers : null}
                consumerTemporalLayers={activeVideoConsumer ? activeVideoConsumer.temporalLayers : null}
                consumerCurrentSpatialLayer={activeVideoConsumer ? activeVideoConsumer.currentSpatialLayer : null}
                consumerCurrentTemporalLayer={activeVideoConsumer ? activeVideoConsumer.currentTemporalLayer : null}
                consumerPreferredSpatialLayer={activeVideoConsumer ? activeVideoConsumer.preferredSpatialLayer : null}
                consumerPreferredTemporalLayer={activeVideoConsumer ? activeVideoConsumer.preferredTemporalLayer : null}
                consumerPriority={activeVideoConsumer ? activeVideoConsumer.priority : null}
                audioTrack={audioConsumer ? audioConsumer.track : null}
                videoTrack={activeVideoConsumer ? activeVideoConsumer.track : null}
                audioMuted={audioMuted}
                videoVisible={activeVideoVisible}
                videoMultiLayer={activeVideoConsumer && activeVideoConsumer.type !== "simple"}
                audioCodec={audioConsumer ? audioConsumer.codec : null}
                videoCodec={activeVideoConsumer ? activeVideoConsumer.codec : null}
                audioScore={audioConsumer ? audioConsumer.score : null}
                videoScore={activeVideoConsumer ? activeVideoConsumer.score : null}
                faceDetection={faceDetection}
                onChangeVideoPreferredLayers={(spatialLayer, temporalLayer) => {
                  roomClient.setConsumerPreferredLayers(activeVideoConsumer.id, spatialLayer, temporalLayer)
                }}
                onChangeVideoPriority={(priority) => {
                  roomClient.setConsumerPriority(activeVideoConsumer.id, priority)
                }}
                onRequestKeyFrame={() => {
                  roomClient.requestConsumerKeyFrame(activeVideoConsumer.id)
                }}
                onStatsClick={onSetStatsPeerId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

Peer.propTypes = {
  roomClient: PropTypes.any.isRequired,
  peer: appPropTypes.Peer.isRequired,
  audioConsumer: appPropTypes.Consumer,
  videoConsumer: appPropTypes.Consumer,
  audioMuted: PropTypes.bool,
  faceDetection: PropTypes.bool.isRequired,
  onSetStatsPeerId: PropTypes.func.isRequired,
}

const mapStateToProps = (state, { id }) => {
  const me = state.me
  const peer = state.peers[id]
  const consumersArray = peer.consumers.map((consumerId) => state.consumers[consumerId])
  const audioConsumer = consumersArray.find((consumer) => consumer.track.kind === "audio")
  const videoConsumer = consumersArray.find((consumer) => consumer.track.kind === "video")
  const videoConsumers = consumersArray.filter((consumer) => consumer.track.kind === "video")

  return {
    peer,
    audioConsumer,
    videoConsumer,
    videoConsumers,
    audioMuted: me.audioMuted,
    faceDetection: state.room.faceDetection,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onSetStatsPeerId: (peerId) => dispatch(stateActions.setRoomStatsPeerId(peerId)),
  }
}

const PeerContainer = withRoomContext(connect(mapStateToProps, mapDispatchToProps)(Peer))

export default PeerContainer
