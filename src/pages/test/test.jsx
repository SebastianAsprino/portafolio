import React from 'react';
import './Test.css';

import viteLogo from '../../image/github-mark-white.svg'

function Test() {
  return (
    <>
    <h1 className="gradient-text">
      Imaginate tener que leer 72 horas de documentacion de css solo para hacer esto :D
    </h1>
    <p>prueba del texto con efecto gradient</p>

    <div ></div>











    <div class="row">
    <div class="col s12 m7">
      <div class="card">
        <div class="card-image">
          <img src={viteLogo}/>
          <span class="card-title">Card Title</span>
        </div>
        <div class="card-content">
          <p>I am a very simple card. I am good at containing small bits of information.
          I am convenient because I require little markup to use effectively.</p>
        </div>
        <div class="card-action">
          <a href="#">This is a link</a>
        </div>
      </div>
    </div>
  </div>

  <div class="row">
    <div class="col s12 m7">
      <div class="card">
        <div class="card-image">
          <img src={viteLogo}/>
          <span class="card-title">Card Title</span>
        </div>
        <div class="card-content">
          <p>I am a very simple card. I am good at containing small bits of information.
          I am convenient because I require little markup to use effectively.</p>
        </div>
        <div class="card-action">
          <a href="#">This is a link</a>
        </div>
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col s12 m7">
      <div class="card">
        <div class="card-image">
          <img src={viteLogo}/>
          <span class="card-title">Card Title</span>
        </div>
        <div class="card-content">
          <p>I am a very simple card. I am good at containing small bits of information.
          I am convenient because I require little markup to use effectively.</p>
        </div>
        <div class="card-action">
          <a href="#">This is a link</a>
        </div>
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col s12 m7">
      <div class="card">
        <div class="card-image">
          <img src={viteLogo}/>
          <span class="card-title">Card Title</span>
        </div>
        <div class="card-content">
          <p>I am a very simple card. I am good at containing small bits of information.
          I am convenient because I require little markup to use effectively.</p>
        </div>
        <div class="card-action">
          <a href="#">This is a link</a>
        </div>
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col s12 m7">
      <div class="card">
        <div class="card-image">
          <img src={viteLogo}/>
          <span class="card-title">Card Title</span>
        </div>
        <div class="card-content">
          <p>I am a very simple card. I am good at containing small bits of information.
          I am convenient because I require little markup to use effectively.</p>
        </div>
        <div class="card-action">
          <a href="#">This is a link</a>
        </div>
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col s12 m7">
      <div class="card">
        <div class="card-image">
          <img src={viteLogo}/>
          <span class="card-title">Card Title</span>
        </div>
        <div class="card-content">
          <p>I am a very simple card. I am good at containing small bits of information.
          I am convenient because I require little markup to use effectively.</p>
        </div>
        <div class="card-action">
          <a href="#">This is a link</a>
        </div>
      </div>
    </div>
  </div>

    <p>Icon buttons:</p>
<button class="btn"><i class="fa fa-home"></i></button>
<button class="btn"><i class="fa fa-bars"></i></button>
<button class="btn"><i class="fa fa-trash"></i></button>
<button class="btn"><i class="fa fa-close"></i></button>
<button class="btn"><i class="fa fa-folder"></i></button>

<p>Icon buttons with text:</p>
<button class="btn"><i class="fa fa-home"></i> Home</button>
<button class="btn"><i class="fa fa-bars"></i> Menu</button>
<button class="btn"><i class="fa fa-trash"></i> Trash</button>
<button class="btn"><i class="fa fa-close"></i> Close</button>
<button class="btn"><i class="fa fa-folder"></i> Folder</button>



    <div class="bi-color-background-50">
      <div class="container mx-auto ">
        <div class="shadow-[75px_-24px_128px_rgba(0,0,0,0.6)] bg-border-gradient-4-gray-800 border border-transparent rounded-3xl p-6 overflow-auto __className_b73b79 mx-auto mb-2 min-h-[330px] max-w-[710px]">
          <div class="text-sm text-gray-200">
            <span># </span>Install Koyeb CLI
            </div>
            <div class="text-white mb-4">
              <span class="text-green-600">$ </span>curl https://www.koyeb.com/install.sh | bash</div>
              <div class="text-sm text-gray-200"><span># </span>Deploy any Git project across regions</div>
              <div class="text-white mb-4"><span class="text-green-600">$ </span>koyeb app init fast --git github.com/koyeb/go --regions fra,was</div>
              <div class="text-white">Building... ✅</div>
              <div class="text-white mb-4">Deploying... Available at <a class="hover:text-green-600" target="_blank" rel="noreferrer noopener" href="https://fast-koyeb.koyeb.app">fast-koyeb.koyeb.app</a> 🚀</div>
              <div class="text-white">Attach go.koyeb.io</div>
              <div class="text-white mb-4"><span class="text-green-600">$ </span>koyeb domains create go.koyeb.io --attach-to fast</div>
              <div class="text-white">Live at <a class="hover:text-green-600" target="_blank" rel="noreferrer noopener" href="https://go.koyeb.io">https://go.koyeb.io</a> 🌎 Enjoy!</div>
              </div><a target="_blank" rel="noreferrer noopener" class="typography-xs block text-center text-gray-200 hover:text-green-600" href="/docs/build-and-deploy/cli/installation">Not on Windows? View all installation options</a></div></div>

    
    
    
    </>
  )
}

export default Test
