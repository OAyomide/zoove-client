## Overview

### What does this (project) do?

This is the client part of the zoove project. Zoove is a platform that lets you get links to music other streaming services from one platform. Lets say you get a link from spotify, with Zoove, you can get the link(s) to the same tracks on Deezer (and other platforms).

In all honesty, the decision to open-source this came from the fact that its a simple (and yet complicated enough) project to get started with React and Go. The aim is to serve as a "tutorial" project for people who are trying to use React and/or Go in a real project while learning.

### What do I need to get started?

Make sure you've created Deezer and Spotify apps. You'd need the credentials to be able to run this. Please check the server setup. You'd need to have the server running to be able to run this.

### How does it work?

Well, its both a mix of magic (🤪) and bunch of API calls.

First, when the link is pasted, it checks if its a shortlink or not. If it's a shortlink, it'll get the preview in order to get the real URL. Then, using websockets, it sends the information to the server. The server proceeds to find the URL on the various platforms and aggregates the results then return back to the client (still using websockets). Please see the server README to know more about how the server does this.

### So what next?

Well, this codebase is pretty much a mess. This needs a lot of rework. For example, there are a lot of duplications (this isnt inherently bad though) and a bunch of "super glue" logic. **This is a dope project for someone interested in getting their hands dirty with React/frontend work.** As time goes on, I'd create issues with necessary tags so new comers interested in contributing can know where to come in.

### ERHM, LICENSE NKO? (WHAT ABOUT LICENSE?)

Well, the client part of zoove (this portion) is provided under the Microsoft Public License. This is because the designs and logos are NOT allowed for use by anybody. **If you want to create your own fork of Zoove, feel free but the designs and logos are not for use. If you do want to use the design, you MUST credit the original creators (big shoutout to the designer/co-creator).**

**PLEASE STICK AROUND. I PLAN TO RELEASE MORE PLATFORM SUPPORTS, FOR EXAMPLE AUDIOMACK AND SOUNDCLOUD. It might not be as quick as expected (because I have a job) but yeah, support still coming for more platforms.**
