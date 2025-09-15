<template>
    <div class="body-shine">
    <div class="shine"></div>
    <div class="background">
      <div class="tiles">
        <div class="tile tile-1"> </div>
        <div class="tile tile-2"> </div>
        <div class="tile tile-3"></div>
        <div class="tile tile-4">
        </div>
        <div class="tile tile-5">
        </div>
        <div class="tile tile-6">
        </div>
        <div class="tile tile-7">
        </div>
        <div class="tile tile-8">
        </div>
        <div class="tile tile-9">
        </div>
        <div class="tile tile-10">
        </div>
      </div>
      <div class="line line-1"></div>
      <div class="line line-2"></div>
      <div class="line line-3"></div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.body-shine {
    --text-color-auth: #A1A1AA;
  
    --card-border-color-auth: rgba(255, 255, 255, 0.1);
    --card-box-shadow-1-auth: rgba(0, 0, 0, 0.05);
    --card-box-shadow-1-auth-y: 3px;
    --card-box-shadow-1-auth-blur: 6px;
    --card-box-shadow-2-auth: rgba(0, 0, 0, 0.1);
    --card-box-shadow-2-auth-y-auth: 8px;
    --card-box-shadow-2-auth-blur-auth: 15px;
    --card-label-color-auth: #FFFFFF;
    --card-icon-color-auth: #D4D4D8;
    --card-icon-background-color-auth: rgba(255, 255, 255, 0.08);
    --card-icon-border-color-authr: rgba(255, 255, 255, 0.12);
    --card-shine-opacity-auth: .1;
    --card-shine-gradient-auth: conic-gradient(from 205deg at 50% 50%, #467df5 0deg, #467df5 25deg, #467df5 295deg, #467df5 360deg);
    --card-line-color-auth: #ffffff0c;
    --card-tile-color-auth: rgba(16, 123, 185, 0.05);
  
    --card-hover-border-color-auth: rgba(255, 255, 255, 0.089);
    --card-hover-box-shadow-1-auth: rgba(0, 0, 0, 0.04);
    --card-hover-box-shadow-1-auth-y: 5px;
    --card-hover-box-shadow-1-auth-blur: 10px;
    --card-hover-box-shadow-2-auth: rgba(0, 0, 0, 0.3);
    --card-hover-box-shadow-2-auth-y: 15px;
    --card-hover-box-shadow-2-auth-blur: 25px;
    --card-hover-icon-color-auth: #467df5;
    --card-hover-icon-background-color-auth: rgba(52, 115, 211, 0.1);
    --card-hover-icon-border-color-auth: rgba(52, 121, 211, 0.2);
    // filter: blur(1px);
    // background-color: $cardBackground;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    z-index: -1;
    transition: box-shadow .25s;
    height: 100vh;
    @media (max-width:768px) {
      height: 600px;
    }
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 15px;
    //   background-color: $cardBackground;
    }
  
    .shine {
      border-radius: inherit;
      position: absolute;
      inset: 0;
      z-index: 1;
      overflow: hidden;
      opacity: 0;
      transition: opacity .5s;
  
      &:before {
        content: '';
        width: 150%;
        padding-bottom: 150%;
        border-radius: 50%;
        position: absolute;
        left: 50%;
        bottom: 55%;
        filter: blur(35px);
        opacity: var(--card-shine-opacity-auth);
        transform: translateX(-50%);
        background-image: var(--card-shine-gradient-auth);
      }
    }
  
    .background {
      border-radius: inherit;
      position: absolute;
      inset: 0;
      overflow: hidden;
      -webkit-mask-image: radial-gradient(circle at 60% 5%, black 0%, black 15%, transparent 60%);
      mask-image: radial-gradient(circle at 60% 5%, black 0%, black 15%, transparent 60%);
      &.ar{
        -webkit-mask-image:  radial-gradient(circle at 5% 60%, black 0%, black 15%, transparent 60%);
        mask-image: radial-gradient(circle at 5% 60%, black 0%, black 15%, transparent 60%);
      }
      .tiles {
        opacity: 0;
        transition: opacity .25s;
  
        .tile {
          position: absolute;
          background-color: #d7e2f7;
          box-shadow:  0 0 7px #d7e2f7,
          0 0 10px #d7e2f7,
          0 0 21px #d7e2f7,
          0 0 42px #d7e2f7,
          0 0 82px #d7e2f7,
          0 0 92px #d7e2f7,
          0 0 102px #d7e2f7,
          0 0 151px #d7e2f7;
          animation-duration: 8s;
          animation-iteration-count: infinite;
          opacity: 0;
          aspect-ratio: 16 / 9;
            img{
                height: 100%;
                @media (max-width:768px) {
                  display: none;
                }
            }
          &.tile-4,
          &.tile-6,
          &.tile-10 {
            animation-delay: -2s;
          }
  
          &.tile-3,
          &.tile-5,
          &.tile-8 {
            animation-delay: -4s;
          }
  
          &.tile-2,
          &.tile-9 {
            animation-delay: -6s;
          }
  
          &.tile-1 {
            top: 0;
            left: 0;
            height: 5%;
            width:5%;
          }
  
          &.tile-2 {
            top: 0;
            left: 22.5%;
            height: 5%;
            width: 5%;
          }
  
          &.tile-3 {
            top: 0;
            left: 50%;
            height: 5%;
            width: 5%;
          }
  
          &.tile-4 {
            top: 0;
            left: 77.5%;
            height: 5%;
            width: 5%;
          }
  
          &.tile-5 {
            top: 5%;
            left: 0;
            height: 5%;
            width: 5%;
          }
  
          &.tile-6 {
            top: 5%;
            left: 22.5%;
            height: 5%;
            width: 5%;
          }
  
          &.tile-7 {
            top: 5%;
            left: 50%;
            height: 5%;
            width: 5%;
          }
  
          &.tile-8 {
            top: 5%;
            left: 77.5%;
            height: 5%;
            width: 5%;
          }
  
          &.tile-9 {
            top: 32.5%;
            left: 50%;
            height: 5%;
            width: 5%;
          }
  
          &.tile-5 {
            top: 32.5%;
            left: 77.5%;
            height: 5%;
            width: 5%;
          }
        }
      }
  
      @keyframes tile {
  
        0%,
        12.5%,
        100% {
          opacity: 1;
        }
  
        25%,
        82.5% {
          opacity: 0;
        }
      }
  
      .line {
        position: absolute;
        inset: 0;
        opacity: 0;
        transition: opacity .35s;
  
        &:before,
        &:after {
          content: '';
          position: absolute;
          background-color: var(--card-line-color-auth);
          transition: transform .35s;
        }
  
        &:before {
          left: 0;
          right: 0;
          height: 1px;
          transform-origin: 0 50%;
          transform: scaleX(0);
        }
  
        &:after {
          top: 0;
          bottom: 0;
          width: 1px;
          transform-origin: 50% 0;
          transform: scaleY(0);
        }
  
        &.line-1 {
          &:before {
            top: 10%;
          }
  
          &:after {
            left: 22.5%;
          }
  
          &:before,
          &:after {
            transition-delay: .3s;
          }
        }
  
        &.line-2 {
          &:before {
            top: 32.5%;
          }
  
          &:after {
            left: 50%;
          }
  
          &:before,
          &:after {
            transition-delay: .15s;
          }
        }
  
        &.line-3 {
          &:before {
            top: 55%;
          }
  
          &:after {
            right: 22.5%;
          }
        }
      }
    }
  

  
      .shine {
        opacity: 1;
        transition-duration: .5s;
        transition-delay: 0s;
      }
  
      .background {
  
        .tiles {
          opacity: 1;
          transition-delay: .25s;
  
          .tile {
            animation-name: tile;
          }
        }
  
        .line {
          opacity: 1;
          transition-duration: .15s;
  
          &:before {
            transform: scaleX(1);
          }
  
          &:after {
            transform: scaleY(1);
          }
  
          &.line-1 {
  
            &:before,
            &:after {
              transition-delay: .0s;
            }
          }
  
          &.line-2 {
  
            &:before,
            &:after {
              transition-delay: .15s;
            }
          }
  
          &.line-3 {
  
            &:before,
            &:after {
              transition-delay: .3s;
            }
          }
        }
      }
}

</style>