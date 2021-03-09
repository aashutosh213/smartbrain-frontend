import React, { Component } from "react";
import Navigation from "./components/Navigation/Navigation";
import SignIn from "./components/SignIn/SignIn";
import Register from "./components/Register/Register";
import Logo from "./components/Logo/Logo";
import Rank from "./components/Rank/Rank";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
//importing particles for background
import Particles from "react-particles-js";

import "./App.css";


const ParticleOption = {
  particles: {
    number: {
      value: 90,
    },
    size: {
      value: 3,
    },
  },
  interactivity: {
    events: {
      onhover: {
        enable: true,
        mode: "repulse",
      },
    },
  },
};

const initialState = {
  input: "",
  imageUrl: "",
  box: {},
  route: "signin",
  isSignedIn: false,
  user: {
    id: "",
    email: "",
    name: "",
    entries: 0,
    joined: "",
  },
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: "",
      imageUrl: "",
      box: {},
      route: "signin",
      isSignedIn: false,
      user: {
        id: "",
        email: "",
        name: "",
        entries: 0,
        joined: "",
      },
    };
  }

  calculateFaceLocation = (data) => {
    const ClarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const Image = document.getElementById("inputImage");
    const Width = Number(Image.width);
    const Height = Number(Image.height);
    return {
      LeftCol: ClarifaiFace.left_col * Width,
      TopRow: ClarifaiFace.top_row * Height,
      RightCol: Width - ClarifaiFace.right_col * Width,
      BottomRow: Height - ClarifaiFace.bottom_row * Height,
    };
  };

  displayFaceBox = (box) => {
    this.setState({ box: box });
  };

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  };

  onPictureSubmit = (event) => {
    this.setState({ imageUrl: this.state.input });
    fetch("http://localhost:4001/imagesurl", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: this.state.input
      }),
    })
    .then(response => response.json())
      .then((response) => {
        console.log("picture", response);
        if (response) {
          fetch("http://localhost:4001/images", {
            method: "put",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: this.state.user.id,
            }),
          })
            .then((response) => response.json())
            .then((count) => {
              this.setState(Object.assign(this.state.user, { entries: count }));
            })
            .catch((err) => {
              console.log();
            });
        }

        this.displayFaceBox(this.calculateFaceLocation(response));
      })
      .catch((err) => console.log(err));
  };

  onRouteChange = (route) => {
    if (route === "signout") {
      this.setState(initialState);
    } else if (route === "home") {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  };

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        entries: data.entries,
        joined: data.joined,
      },
    });
  };

  render() {
    const { isSignedIn, box, imageUrl, route } = this.state;
    return (
      <div className="App">
        <Particles className="Particles" params={ParticleOption} />
        <Navigation
          isSignedin={isSignedIn}
          onRouteChange={this.onRouteChange}
        />
        {route === "home" ? (
          <div>
            <Logo />
            <Rank
              name={this.state.user.name}
              entries={this.state.user.entries}
            />
            <ImageLinkForm
              onInputChange={this.onInputChange} //detects input change
              onPictureSubmit={this.onPictureSubmit} //recons the click on button
            />
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
        ) : route === "signin" ? (
          <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        ) : (
          <Register
            loadUser={this.loadUser}
            onRouteChange={this.onRouteChange}
          />
        )}
      </div>
    );
  }
}

export default App;
