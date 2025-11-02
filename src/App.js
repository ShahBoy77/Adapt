import React, { useState, useRef, useEffect } from "react";
import "./App.css";

// ---------------- LIGHTNING BACKGROUND (same as before) ----------------
const Lightning = ({ hue = 230, xOffset = 0, speed = 1, intensity = 1, size = 1 }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const vertexShaderSource = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform float uHue;
      uniform float uXOffset;
      uniform float uSpeed;
      uniform float uIntensity;
      uniform float uSize;
      #define OCTAVE_COUNT 10
      vec3 hsv2rgb(vec3 c) {
        vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
        return c.z * mix(vec3(1.0), rgb, c.y);
      }
      float hash12(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * .1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }
      float noise(vec2 p) {
        vec2 ip = floor(p);
        vec2 fp = fract(p);
        float a = hash12(ip);
        float b = hash12(ip + vec2(1.0, 0.0));
        float c = hash12(ip + vec2(0.0, 1.0));
        float d = hash12(ip + vec2(1.0, 1.0));
        vec2 t = smoothstep(0.0, 1.0, fp);
        return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
      }
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < OCTAVE_COUNT; ++i) {
          value += amplitude * noise(p);
          p *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }
      void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        vec2 uv = fragCoord / iResolution.xy;
        uv = 2.0 * uv - 1.0;
        uv.x *= iResolution.x / iResolution.y;
        uv.x += uXOffset;
        uv += 2.0 * fbm(uv * uSize + 0.8 * iTime * uSpeed) - 1.0;
        float dist = abs(uv.x);
        vec3 baseColor = hsv2rgb(vec3(uHue / 360.0, 0.7, 0.8));
        vec3 col = baseColor * pow(mix(0.0, 0.07, fract(iTime * uSpeed)) / dist, 1.0) * uIntensity;
        fragColor = vec4(col, 1.0);
      }
      void main() {
        mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `;

    const compileShader = (src, type) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };
    const v = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const f = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    const p = gl.createProgram();
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.linkProgram(p);
    gl.useProgram(p);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const a = gl.getAttribLocation(p, "aPosition");
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);

    const iR = gl.getUniformLocation(p, "iResolution");
    const iT = gl.getUniformLocation(p, "iTime");
    const uH = gl.getUniformLocation(p, "uHue");
    const uX = gl.getUniformLocation(p, "uXOffset");
    const uS = gl.getUniformLocation(p, "uSpeed");
    const uI = gl.getUniformLocation(p, "uIntensity");
    const uZ = gl.getUniformLocation(p, "uSize");

    const start = performance.now();
    const render = () => {
      resizeCanvas();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(iR, canvas.width, canvas.height);
      const now = performance.now();
      gl.uniform1f(iT, (now - start) / 1000);
      gl.uniform1f(uH, hue);
      gl.uniform1f(uX, xOffset);
      gl.uniform1f(uS, speed);
      gl.uniform1f(uI, intensity);
      gl.uniform1f(uZ, size);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    };
    render();
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [hue, xOffset, speed, intensity, size]);
  return <canvas ref={canvasRef} className="lightning-container" />;
};

// ---------------- APP START ----------------
const App = () => {
  const [page, setPage] = useState("home");
  const [popup, setPopup] = useState(null);
  const [user, setUser] = useState({});
  const [order, setOrder] = useState({ units: "", amount: 0 });

  const handleSignup = (type, data) => {
    setUser({ ...data, type });
    setPopup(null);
    setPage("main");
  };

  const calcAmount = (units) => (units <= 100 ? units * 3 : units * 9);

  return (
    <div className="app">
      {/* -------- HOME PAGE -------- */}
      {page === "home" && (
        <>
          <Lightning />
          <div className="overlay">
            <h1 className="title">GRIDLY</h1>
            <div className="buttons">
              <button onClick={() => setPopup("seller")}>Sign Up as Seller</button>
              <button onClick={() => setPopup("buyer")}>Sign Up as Buyer</button>
              <button onClick={() => setPopup("login")}>Login</button>
            </div>
          </div>
        </>
      )}

      {/* -------- MAIN PAGE -------- */}
      {page === "main" && (
        <div className="main-page">
          <nav className="navbar">
            <div className="logo">GRIDLY</div>
            <div className="nav-buttons">
              <button onClick={() => setPage("about")}>About Us</button>
              <button onClick={() => setPopup("profile")}>👤</button>
            </div>
          </nav>

          <div className="main-body">
            <div className="slider">
              <div className="slide-track">
                <div className="slide">"Harness the sun — power your future!"</div>
                <div className="slide">"Save energy, save money, save the planet."</div>
                <div className="slide">"Brighten your home with clean solar power."</div>
              </div>
            </div>
            <button className="order-btn" onClick={() => setPopup("order")}>
              Place Order
            </button>
          </div>
        </div>
      )}

      {/* -------- ABOUT PAGE -------- */}
      {page === "about" && (
        <div className="about-page">
          <nav className="navbar">
            <div className="logo">GRIDLY</div>
            <div className="nav-buttons">
              <button onClick={() => setPage("main")}>Back</button>
            </div>
          </nav>
          <div className="about-body">
            <h2>About GRIDLY</h2>
            <p><h2><center>
              WattSup is an urban clean-energy startup committed to reshaping how cities consume power. Our mission is simple: make renewable energy accessible, affordable, and shareable.
 
We bridge the gap between solar producers who generate surplus electricity and urban consumers who want cheaper, greener power — all through a transparent, tech-driven platform. By integrating IoT-based smart metering, real-time data analytics, and secure digital transactions, WattSup enables peer-to-peer energy trading within cities.
 
We believe energy shouldn’t just flow from large power plants to passive consumers — it should circulate within communities, rewarding those who produce clean power and helping others save.
 
Our vision is to transform Indian cities into self-sustaining, energy-smart ecosystems — where every rooftop can power not just one home, but an entire neighborhood.
 
            </center></h2></p>
          </div>
        </div>
      )}

      {/* -------- POPUPS -------- */}
      {popup && (
        <div className="popup-overlay">
          <div className="popup">
            {popup === "seller" && (
              <>
                <h3>Seller Sign Up</h3>
                <SignupForm onSubmit={(data) => handleSignup("seller", data)} />
              </>
            )}
            {popup === "buyer" && (
              <>
                <h3>Buyer Sign Up</h3>
                <SignupForm onSubmit={(data) => handleSignup("buyer", data)} isBuyer />
              </>
            )}
            {popup === "login" && (
              <>
                <h3>Login</h3>
                <LoginForm onSubmit={(data) => handleSignup("login", data)} />
              </>
            )}
            {popup === "profile" && (
              <>
                <h3>Profile</h3>
                <button onClick={() => alert(JSON.stringify(user, null, 2))}>Account Info</button>
                <button onClick={() => alert("No orders yet")}>Order History</button>
                <button onClick={() => alert("Tracking on map...")}>Tracking</button>
              </>
            )}
            {popup === "order" && (
              <>
                <h3>Place Order</h3>
                <input
                  type="number"
                  placeholder="Units required"
                  value={order.units}
                  onChange={(e) =>
                    setOrder({ units: e.target.value, amount: calcAmount(Number(e.target.value)) })
                  }
                />
                <input type="text" placeholder="Pincode" />
                {order.units && <p>Amount Payable: ₹{order.amount}</p>}
                {order.units && (
                  <button onClick={() => setPopup("payment")}>Proceed</button>
                )}
              </>
            )}
            {popup === "payment" && (
              <>
                <h3>Payment Options</h3>
                <button onClick={() => alert("Paid with Google Pay!")}>Google Pay</button>
                <button onClick={() => alert("Paid with Card!")}>Card</button>
              </>
            )}
            <button className="close-btn" onClick={() => setPopup(null)}>
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ------------- FORMS -------------
const SignupForm = ({ onSubmit, isBuyer }) => {
  const [form, setForm] = useState({});
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      {isBuyer && (
        <input placeholder="Address" onChange={(e) => setForm({ ...form, address: e.target.value })} />
      )}
      <input placeholder="Pincode" onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

const LoginForm = ({ onSubmit }) => {
  const [form, setForm] = useState({});
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default App;
