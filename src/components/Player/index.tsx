import { useEffect, useRef, useState } from 'react'
import { usePlayer } from '../../contexts/PlayerContext'
import Slider from 'rc-slider'

import 'rc-slider/assets/index.css'

import Image from 'next/image'
import { IoIosClose } from 'react-icons/io'

import styles from './styles.module.scss'
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString'

export function Player() {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [progress, setProgress] = useState(0)

    function setupProgressListener() {
        audioRef.current.currentTime = 0

        audioRef.current.addEventListener('timeupdate', () => {
            setProgress(Math.floor(audioRef.current.currentTime))
        })
    }

    function handleSeek(amount: number) {
        audioRef.current.currentTime = amount
        setProgress(amount)
    }


    const {
        episodeList,
        currentEpisodeIndex,
        isPlaying,
        isLooping,
        isShuffling,
        togglePlay,
        setPlayingState,
        playNext,
        playPrevious,
        hasNext,
        hasPrevious,
        toggleShuffle,
        toggleLoop,
        clearPlayer
    } = usePlayer()


    function handleEpisodeEndend() {
        if (hasNext) {
            playNext()
        } else {
            clearPlayer()
        }
    }


    const episode = episodeList[currentEpisodeIndex]

    useEffect(() => {
        if (!audioRef.current) {
            return
        }

        if (isPlaying) {
            audioRef.current.play()
        } else {
            audioRef.current.pause()
        }
    }, [isPlaying])
    return (
        <div className={styles.playerContainer}>
            <IoIosClose size={30} onClick={clearPlayer} />
            <header>
                <img src="playing.svg" alt="Tocando agora" />
                <strong>Tocando agora</strong>
            </header>

            { episode ? (
                <div className={styles.currentEpisode}>
                    <Image
                        width={592}
                        height={592}
                        src={episode.thumbnail}
                        objectFit='cover'
                    />
                    <strong>{episode.title}</strong>
                    <span>{episode.members}</span>
                </div>
            ) : (
                <div className={styles.emptyPlayer}>
                    <strong>Selecione um podcast para ouvir</strong>
                </div>
            )}

            <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>
                    <span>{convertDurationToTimeString(progress)}</span>
                    <div className={styles.slider}>
                        {episode ? (
                            <Slider
                                max={episode.duration}
                                value={progress}
                                onChange={handleSeek}
                                trackStyle={{ backgroundColor: '#04d361' }}
                                railStyle={{ backgroundColor: '#9f75ff' }}
                                handleStyle={{ borderColor: '#04d361', borderWidth: 4 }}
                            />
                        ) : (
                            <div className={styles.emptySlider} />)}
                    </div>
                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                </div>

                {episode && (
                    <audio
                        onEnded={handleEpisodeEndend}
                        src={episode.url}
                        autoPlay
                        loop={isLooping}
                        ref={audioRef}
                        onLoadedMetadata={setupProgressListener}
                        onPlay={() => setPlayingState(true)}
                        onPause={() => setPlayingState(false)}
                    />
                )}

                <div className={styles.buttons}>
                    <button
                        type='button'
                        disabled={!episode}
                        onClick={toggleShuffle}
                        className={isShuffling ? styles.isActive : ''}
                    >
                        <img src="/shuffle.svg" alt="Embaralhar" />
                    </button>
                    <button type='button' disabled={!hasPrevious}>
                        <img src="/play-previous.svg" alt="Tocar anterior" onClick={playPrevious} />
                    </button>
                    <button
                        type='button'
                        className={styles.playButton}
                        disabled={!episode}
                        onClick={togglePlay}
                    >
                        {isPlaying ? (
                            <img src="/pause.svg" alt="Pausar" />
                        ) : (
                            <img src="/play.svg" alt="Tocar" />
                        )}
                    </button>
                    <button type='button' disabled={!hasNext} onClick={playNext}>
                        <img src="/play-next.svg" alt="Tocar próxima" />
                    </button>
                    <button
                        type='button'
                        disabled={!episode}
                        onClick={toggleLoop}
                        className={isLooping ? styles.isActive : ''}
                    >
                        <img src="/repeat.svg" alt="Repetir" />
                    </button>
                </div>
            </footer>
        </div>
    )
}