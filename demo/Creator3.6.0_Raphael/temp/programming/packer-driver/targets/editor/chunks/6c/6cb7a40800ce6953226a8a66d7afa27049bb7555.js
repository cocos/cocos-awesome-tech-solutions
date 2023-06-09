System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Vec2, view, Color, misc, Tentacle, _dec, _class, _crd, ccclass, property, colours, Jelly;

  function _reportPossibleCrUseOfTentacle(extras) {
    _reporterNs.report("Tentacle", "./tentacle", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Vec2 = _cc.Vec2;
      view = _cc.view;
      Color = _cc.Color;
      misc = _cc.misc;
    }, function (_unresolved_2) {
      Tentacle = _unresolved_2.Tentacle;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "04ff5H0b39GeaOcG0RdNTXo", "jelly", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Vec2', 'view', 'Color', 'misc']);

      ({
        ccclass,
        property
      } = _decorator);
      colours = [{
        s: '#1C4347',
        f: '#49ACBB'
      }, {
        s: '#1b3b3a',
        f: '#61cac8'
      }, {
        s: '#2d393f',
        f: '#88a5b3'
      }, {
        s: '#422b3a',
        f: '#b0809e'
      }, {
        s: '#5b263a',
        f: '#d85c8a'
      }, {
        s: '#580c23',
        f: '#ff3775'
      }, {
        s: '#681635',
        f: '#EB1962'
      }];

      _export("Jelly", Jelly = (_dec = ccclass('Jelly'), _dec(_class = class Jelly extends Component {
        constructor(...args) {
          super(...args);
          this.pathSides = 14;
          this.group = null;
          this.path = null;
          this.pathRadius = null;
          this.pathPoints = [];
          this.pathPointsNormals = [];
          this.location = new Vec2();
          this.velocity = new Vec2();
          this.acceleration = new Vec2();
          this.maxSpeed = 0;
          this.maxTravelSpeed = 0;
          this.maxForce = 0.2;
          this.wanderTheta = 0;
          this.numTentacles = 0;
          this.startTentacles = -1;
          this.tentacles = [];
          this.originalPoints = null;
          this.lastLocation = null;
        }

        onLoad() {}

        init(group, id) {
          this.group = group;
          this.path = group.addPath();
          this.pathRadius = Math.random() * 10 + 40;
          this.pathPoints = [this.pathSides];
          this.pathPointsNormals = [this.pathSides];
          this.location.set(view.getVisibleSize().width / 2, view.getVisibleSize().height / 2); //cc.v2(-50, Math.random() * cc.winSize.height);

          this.maxSpeed = Math.random() * 0.1 + 0.15;
          this.maxTravelSpeed = this.maxSpeed * 3.5;
          let theta = Math.PI * 2 / this.pathSides;

          for (let i = 0; i < this.pathSides; i++) {
            let angle = theta * i;
            let x = Math.cos(angle) * this.pathRadius * 0.7;
            let y = Math.sin(angle) * this.pathRadius;

            if (angle > Math.PI && angle < Math.PI * 2) {
              y -= Math.sin(angle) * (this.pathRadius * 0.6);

              if (this.startTentacles === -1) {
                this.startTentacles = i;
              }

              this.numTentacles++;
            }

            let point = new Vec2(x, y);

            let _tempPoint = new Vec2();

            this.pathPoints[i] = point;
            Vec2.normalize(_tempPoint, point);
            this.pathPointsNormals[i] = _tempPoint;
          }

          this.originalPoints = this.pathPoints.map(function (point) {
            return point.clone();
          });
          this.path.points(this.pathPoints, true);
          this.path.smoothFunc();
          this.path.lineWidth = 5;
          this.path.lineColor = new Color().fromHEX(colours[id].s);
          this.path.fillColor = new Color().fromHEX(colours[id].f);
          this.tentacles = [];

          for (var t = 0; t < this.numTentacles; t++) {
            this.tentacles[t] = new (_crd && Tentacle === void 0 ? (_reportPossibleCrUseOfTentacle({
              error: Error()
            }), Tentacle) : Tentacle)();
            this.tentacles[t].init(group, 7, 4);
            this.tentacles[t].path.lineColor = this.path.lineColor;
            this.tentacles[t].path.lineWidth = this.path.lineWidth;
          }
        }

        update(time, count) {
          this.lastLocation = this.location.clone();
          this.velocity.x += this.acceleration.x;
          this.velocity.y += this.acceleration.y;
          var sep = this.velocity.length() / this.maxTravelSpeed;

          if (sep > 1) {
            this.velocity.x /= sep;
            this.velocity.y /= sep;
          }

          this.location.x += this.velocity.x;
          this.location.y += this.velocity.y;
          this.acceleration.x = this.acceleration.y = 0;
          this.path.position = this.location.clone();
          var orientation = -(Math.atan2(this.velocity.y, this.velocity.x) - Math.PI / 2);
          this.path.rotation = misc.radiansToDegrees(orientation);

          for (let i = 0; i < this.pathSides; i++) {
            //    var segmentPoint = this.pathPoints[i];
            let sineSeed = -(count * this.maxSpeed + this.originalPoints[i].y * 0.0375);
            let normalRotatedPoint = this.pathPointsNormals[i];
            this.pathPoints[i].x += normalRotatedPoint.x * Math.sin(sineSeed);
            this.pathPoints[i].y += normalRotatedPoint.y * Math.sin(sineSeed);
          }

          this.path.points(this.pathPoints, true);
          this.path.smoothFunc();
          this.wander();
          this.checkBounds();

          for (let t = 0; t < this.numTentacles; t++) {
            this.tentacles[t].anchor.x = this.pathPoints[this.startTentacles + t].x;
            this.tentacles[t].anchor.y = this.pathPoints[this.startTentacles + t].y;
            this.tentacles[t].path.position = this.path.position;
            this.tentacles[t].path.rotation = this.path.rotation;
            this.tentacles[t].update();
          }
        }

        steer(target, slowdown) {
          var steer;
          var desired = new Vec2(target.x - this.location.x, target.y - this.location.y);
          var dist = desired.length();

          if (dist > 0) {
            if (slowdown && dist < 100) {
              desired.divide2f(this.maxTravelSpeed * (dist / 100) / dist, this.maxTravelSpeed * (dist / 100) / dist);
            } else {
              desired.length = this.maxTravelSpeed;
              desired.divide2f(this.maxTravelSpeed / dist, this.maxTravelSpeed / dist);
            }

            steer = new Vec2(desired.x - this.velocity.x, desired.y - this.velocity.y);
            steer.length = Math.min(this.maxForce, steer.length());
          } else {
            steer = new Vec2(0, 0);
          }

          return steer;
        }

        seek(target) {
          var steer = this.steer(target, false);
          this.acceleration.x += steer.x;
          this.acceleration.y += steer.y;
        }

        wander() {
          var wanderR = 5;
          var wanderD = 100;
          var change = 0.05;
          this.wanderTheta += Math.random() * (change * 2) - change;
          var circleLocation = this.velocity.clone();

          let _tempLocation = new Vec2();

          if (circleLocation.x !== 0 && circleLocation.y !== 0) {
            Vec2.normalize(_tempLocation, circleLocation);
            circleLocation = circleLocation.normalize();
          }

          circleLocation.x *= wanderD;
          circleLocation.y *= wanderD;
          circleLocation.x += this.location.x;
          circleLocation.y += this.location.y;
          var circleOffset = new Vec2(wanderR * Math.cos(this.wanderTheta), wanderR * Math.sin(this.wanderTheta));
          var target = new Vec2(circleLocation.x + circleOffset.x, circleLocation.y + circleOffset.y);
          this.seek(target);
        }

        checkBounds() {
          let offset = 60;
          let visibleSize = view.getFrameSize();

          if (this.location.x < -offset) {
            this.location.x = visibleSize.width + offset;
          }

          if (this.location.x > visibleSize.width + offset) {
            this.location.x = -offset;
          }

          if (this.location.y < -offset) {
            this.location.y = visibleSize.height + offset;
          }

          if (this.location.y > visibleSize.height + offset) {
            this.location.y = -offset;
          }
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=6cb7a40800ce6953226a8a66d7afa27049bb7555.js.map