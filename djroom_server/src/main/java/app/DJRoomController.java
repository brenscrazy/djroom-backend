package app;

import org.springframework.web.bind.annotation.*;

import java.util.ArrayDeque;
import java.util.List;
import java.util.Queue;

@RestController
public class DJRoomController {

    private VideoData currentVideo = null;
    private long startedToPlay;
    private final static String API_KEY = "AIzaSyA2fmGLS4HZnrkgmPsvhweag2K6oE6ZHM8";
    private final Queue<VideoData> playlist = new ArrayDeque<>();

    @RequestMapping("/playlist")
    public List<VideoData> getPlaylist() {
        List<VideoData> currentPlaylist = playlist.stream().toList();
        return currentPlaylist;
    }

    @PostMapping("/post-video")
    public List<VideoData> postVideo(@RequestBody VideoData pair) {
        playlist.add(pair);
        if (playlist.size() == 1) {
            startedToPlay = System.currentTimeMillis();
            currentVideo = playlist.peek();
            new java.util.Timer().schedule(new java.util.TimerTask() {
                                               @Override
                                               public void run() {
                                                   playlist.poll();
                                                   runVideo();
                                               }
                                           }, (currentVideo.duration + 10) * 1000L
            );
        }
        return getPlaylist();
    }

    @RequestMapping("/plays-now")
    public PlayingRightNow playsNow(){
        if (currentVideo == null) {
            return new PlayingRightNow();
        }
        return new PlayingRightNow(System.currentTimeMillis() - startedToPlay, currentVideo.videoId);
    }
//{"videoId" : "lol", "duration" : 10}
    synchronized public void runVideo() {
        startedToPlay = System.currentTimeMillis();
        VideoData pair = playlist.peek();
        currentVideo = pair;
        if (pair == null) {
            return;
        }
        new java.util.Timer().schedule(new java.util.TimerTask() {
                                           @Override
                                           public void run() {
                                               playlist.poll();
                                               runVideo();
                                           }
                                       }, (pair.duration + 10) * 1000L
        );
    }

}
