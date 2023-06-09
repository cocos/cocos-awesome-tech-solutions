System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, Vec2, Vec3, Vec4, Color, primitives, math, gfx, FastHull, _crd, tempVec3;

  function readAttribute(data, constructor) {
    var out = [];
    var size = 0;

    switch (constructor) {
      case Vec3:
        size = 3;
        break;

      case Vec2:
        size = 2;
        break;

      case Vec4:
      case Color:
        size = 4;
        break;

      default:
        console.warn('unexpect type');
        break;
      // return
    }

    for (var i = 0; i < Math.ceil(data.length / size); i++) {
      var start = i * size;
      var end = start + size;
      out.push(new constructor(...data.slice(start, end)));
    }

    return out;
  }

  function writeAttribute(data) {
    var out = [];

    if (data[0] instanceof Vec3) {
      for (var i = 0, l = data.length; i < l; i++) {
        out.push(data[i].x, data[i].y, data[i].z);
      }
    } else if (data[0] instanceof Vec2) {
      for (var _i5 = 0, _l = data.length; _i5 < _l; _i5++) {
        out.push(data[_i5].x, data[_i5].y);
      }
    } else if (data[0] instanceof Vec4) {
      for (var _i6 = 0, _l2 = data.length; _i6 < _l2; _i6++) {
        out.push(data[_i6].x, data[_i6].y, data[_i6].z, data[_i6].w);
      }
    } else if (data[0] instanceof Color) {
      for (var _i7 = 0, _l3 = data.length; _i7 < _l3; _i7++) {
        out.push(data[_i7].x, data[_i7].y, data[_i7].z, data[_i7].w);
      }
    }

    return out;
  }

  _export("FastHull", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Vec2 = _cc.Vec2;
      Vec3 = _cc.Vec3;
      Vec4 = _cc.Vec4;
      Color = _cc.Color;
      primitives = _cc.primitives;
      math = _cc.math;
      gfx = _cc.gfx;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "16b90EdeGJLGayO2RO2TxzC", "FastHull", undefined);

      __checkObsolete__(['Vec2', 'Vec3', 'Vec4', 'Color', 'Mesh', 'primitives', 'math', 'gfx']);

      tempVec3 = new Vec3(0, 0, 0);

      _export("FastHull", FastHull = class FastHull {
        constructor(mesh) {
          this.isValid = true;
          this.vertices = void 0;
          this.normals = new Array();
          this.colors = new Array();
          this.tangents = new Array();
          this.uvs = new Array();
          this.indices = new Array();
          this.center = new Vec3();
          this.size = new Vec3();
          this.minPos = new Vec3();
          this.maxPos = new Vec3();

          if (mesh instanceof FastHull) {
            this.vertices = [];
            this.indices = [];

            if (mesh.normals && mesh.normals.length > 0) {
              this.normals = [];
            }

            if (mesh.colors && mesh.colors.length > 0) {
              this.colors = [];
            }

            if (mesh.tangents && mesh.tangents.length > 0) {
              this.tangents = [];
            }

            if (mesh.uvs && mesh.uvs.length > 0) {
              this.uvs = [];
            }
          } else {
            mesh = mesh;
            this.vertices = readAttribute(mesh.positions, Vec3);
            this.indices = mesh.indices;

            if (mesh.normals && mesh.normals.length > 0) {
              this.normals = readAttribute(mesh.normals, Vec3);
            }

            if (mesh.uvs && mesh.uvs.length > 0) {
              this.uvs = readAttribute(mesh.uvs, Vec2);
            }

            if (mesh.colors && mesh.colors.length > 0) {
              this.colors = readAttribute(mesh.colors, Color);
            }

            if (mesh.tangents && mesh.tangents.length > 0) {
              this.tangents = readAttribute(mesh.tangents, Vec4);
            }

            if (mesh.minPos && mesh.maxPos) {
              this.center = Vec3.add(new Vec3(), mesh.minPos, mesh.maxPos).multiplyScalar(1 / 2);
              this.size = Vec3.subtract(new Vec3(), mesh.maxPos, mesh.minPos);
            } // console.log(this)

          }
        }

        get IsEmpty() {
          return !this.isValid || this.vertices.length < 3 || this.indices.length < 3;
        }

        GetMesh(hull) {
          if (this.isValid) {
            var _mesh = {
              positions: []
            };
            _mesh.positions = writeAttribute(hull.vertices);
            _mesh.indices = hull.indices;
            _mesh.customAttributes = [];

            if (hull.normals) {
              _mesh.normals = writeAttribute(hull.normals);
            }

            if (hull.colors) {
              _mesh.normals = writeAttribute(hull.colors);
            }

            if (hull.tangents) {
              _mesh.customAttributes.push({
                attr: new gfx.Attribute(gfx.AttributeName.ATTR_TANGENT, gfx.Format.RGB32F),
                values: writeAttribute(hull.tangents)
              });

              _mesh.tangents = writeAttribute(hull.tangents);
            }

            if (hull.uvs) {
              _mesh.uvs = writeAttribute(hull.uvs);
            }

            return _mesh;
          }

          return primitives.box({
            width: 1,
            height: 1,
            length: 1
          });
        }

        Split(localPointOnPlane, localPlaneNormal, fillCut) {
          if (localPlaneNormal.equals(Vec3.ZERO)) {
            localPlaneNormal.set(Vec3.UP);
          }

          var a = new FastHull(this);
          var b = new FastHull(this);
          var vertexAbovePlane = [];
          var oldToNewVertexMap = [];
          this.AssignVertices(a, b, localPointOnPlane, localPlaneNormal, vertexAbovePlane, oldToNewVertexMap);
          var cutEdges = [];
          var cutColors = [];
          this.AssignTriangles(a, b, vertexAbovePlane, oldToNewVertexMap, localPointOnPlane, localPlaneNormal, cutEdges, cutColors);

          if (fillCut) {
            // this.FillCutEdges(a, b, cutEdges, localPlaneNormal, uvMapper);
            if (!this.FastFillCutEdges(a, b, cutEdges, localPointOnPlane, localPlaneNormal, cutColors)) {
              return [];
            }
          }

          this.ValidateOutput(a, b, localPlaneNormal); // Set output

          return [this.GetMesh(a), this.GetMesh(b)];
        }

        AssignVertices(a, b, pointOnPlane, planeNormal, vertexAbovePlane, oldToNewVertexMap) {
          for (var i = 0; i < this.vertices.length; i++) {
            var vertex = this.vertices[i];
            var abovePlane = Vec3.subtract(tempVec3, vertex, pointOnPlane).dot(planeNormal) >= 0;
            vertexAbovePlane[i] = abovePlane;

            if (abovePlane) {
              // Assign vertex to hull A
              oldToNewVertexMap[i] = a.vertices.length;
              a.vertices.push(vertex);

              if (this.normals) {
                a.normals.push(this.normals[i]);
              }

              if (this.colors) {
                a.colors.push(this.colors[i]);
              }

              if (this.tangents) {
                a.tangents.push(this.tangents[i]);
              }

              if (this.uvs) {
                a.uvs.push(this.uvs[i]);
              }
            } else {
              // Assign vertex to hull B
              oldToNewVertexMap[i] = b.vertices.length;
              b.vertices.push(vertex);

              if (this.normals) {
                b.normals.push(this.normals[i]);
              }

              if (this.colors) {
                b.colors.push(this.colors[i]);
              }

              if (this.tangents) {
                b.tangents.push(this.tangents[i]);
              }

              if (this.uvs) {
                b.uvs.push(this.uvs[i]);
              }
            }
          }
        }

        AssignTriangles(a, b, vertexAbovePlane, oldToNewVertexMap, pointOnPlane, planeNormal, cutEdges, cutColors) {
          var triangleCount = this.indices.length / 3;

          for (var i = 0; i < triangleCount; i++) {
            var index0 = this.indices[i * 3 + 0];
            var index1 = this.indices[i * 3 + 1];
            var index2 = this.indices[i * 3 + 2];
            var above0 = vertexAbovePlane[index0];
            var above1 = vertexAbovePlane[index1];
            var above2 = vertexAbovePlane[index2];

            if (above0 && above1 && above2) {
              // Assign triangle to hull A
              a.indices.push(oldToNewVertexMap[index0]);
              a.indices.push(oldToNewVertexMap[index1]);
              a.indices.push(oldToNewVertexMap[index2]);
            } else if (!above0 && !above1 && !above2) {
              // Assign triangle to hull B
              b.indices.push(oldToNewVertexMap[index0]);
              b.indices.push(oldToNewVertexMap[index1]);
              b.indices.push(oldToNewVertexMap[index2]);
            } else {
              // Split triangle
              var top = void 0;
              var cw = void 0;
              var ccw = void 0;

              if (above1 == above2 && above0 != above1) {
                top = index0;
                cw = index1;
                ccw = index2;
              } else if (above2 == above0 && above1 != above2) {
                top = index1;
                cw = index2;
                ccw = index0;
              } else {
                top = index2;
                cw = index0;
                ccw = index1;
              }

              var cutVertex0 = new Vec3();
              var cutVertex1 = new Vec3();
              var cutColor0 = new Color();
              var cutColor1 = new Color();

              if (vertexAbovePlane[top]) {
                this.SplitTriangle(a, b, oldToNewVertexMap, pointOnPlane, planeNormal, top, cw, ccw, cutVertex0, cutVertex1, cutColor0, cutColor1);
              } else {
                this.SplitTriangle(b, a, oldToNewVertexMap, pointOnPlane, planeNormal, top, cw, ccw, cutVertex1, cutVertex0, cutColor1, cutColor0);
              } // Add cut edge


              if (!cutVertex0.equals(cutVertex1)) {
                cutEdges.push(cutVertex0);
                cutEdges.push(cutVertex1);

                if (this.colors) {
                  cutColors == null ? void 0 : cutColors.push(cutColor0);
                  cutColors == null ? void 0 : cutColors.push(cutColor1);
                }
              }
            }
          }
        }

        SplitTriangle(topHull, bottomHull, oldToNewVertexMap, pointOnPlane, planeNormal, top, cw, ccw, cwIntersection, ccwIntersection, cwColorIntersection, ccwColorIntersection) {
          var v0 = this.vertices[top];
          var v1 = this.vertices[cw];
          var v2 = this.vertices[ccw]; // Intersect the top-cw edge with the plane

          var cwDenominator = Vec3.subtract(tempVec3, v1, v0).dot(planeNormal);
          var cwScalar = math.clamp01(Vec3.subtract(tempVec3, pointOnPlane, v0).dot(planeNormal) / cwDenominator); // Intersect the top-ccw edge with the plane

          var ccwDenominator = Vec3.subtract(tempVec3, v2, v0).dot(planeNormal);
          var ccwScalar = math.clamp01(Vec3.subtract(tempVec3, pointOnPlane, v0).dot(planeNormal) / ccwDenominator); // Interpolate vertex positions

          var cwVertex = new Vec3();
          cwVertex.x = v0.x + (v1.x - v0.x) * cwScalar;
          cwVertex.y = v0.y + (v1.y - v0.y) * cwScalar;
          cwVertex.z = v0.z + (v1.z - v0.z) * cwScalar;
          var ccwVertex = new Vec3();
          ccwVertex.x = v0.x + (v2.x - v0.x) * ccwScalar;
          ccwVertex.y = v0.y + (v2.y - v0.y) * ccwScalar;
          ccwVertex.z = v0.z + (v2.z - v0.z) * ccwScalar; // Create top triangle

          var cwA = topHull.vertices.length;
          topHull.vertices.push(cwVertex);
          var ccwA = topHull.vertices.length;
          topHull.vertices.push(ccwVertex);
          topHull.indices.push(oldToNewVertexMap[top]);
          topHull.indices.push(cwA);
          topHull.indices.push(ccwA); // Create bottom triangles

          var cwB = bottomHull.vertices.length;
          bottomHull.vertices.push(cwVertex);
          var ccwB = bottomHull.vertices.length;
          bottomHull.vertices.push(ccwVertex);
          bottomHull.indices.push(oldToNewVertexMap[cw]);
          bottomHull.indices.push(oldToNewVertexMap[ccw]);
          bottomHull.indices.push(ccwB);
          bottomHull.indices.push(oldToNewVertexMap[cw]);
          bottomHull.indices.push(ccwB);
          bottomHull.indices.push(cwB); // Interpolate normals

          if (this.normals && this.colors.length >= 3) {
            var n0 = this.normals[top];
            var n1 = this.normals[cw];
            var n2 = this.normals[ccw];
            var cwNormal = new Vec3();
            cwNormal.x = n0.x + (n1.x - n0.x) * cwScalar;
            cwNormal.y = n0.y + (n1.y - n0.y) * cwScalar;
            cwNormal.z = n0.z + (n1.z - n0.z) * cwScalar;
            cwNormal.normalize();
            var ccwNormal = new Vec3();
            ccwNormal.x = n0.x + (n2.x - n0.x) * ccwScalar;
            ccwNormal.y = n0.y + (n2.y - n0.y) * ccwScalar;
            ccwNormal.z = n0.z + (n2.z - n0.z) * ccwScalar;
            ccwNormal.normalize(); // Add vertex property

            topHull.normals.push(cwNormal);
            topHull.normals.push(ccwNormal);
            bottomHull.normals.push(cwNormal);
            bottomHull.normals.push(ccwNormal);
          } // Interpolate colors


          if (this.colors && this.colors.length >= 3) {
            var c0 = this.colors[top];
            var c1 = this.colors[cw];
            var c2 = this.colors[ccw];
            var cwColor = Color.lerp(new Color(), c0, c1, cwScalar);
            var ccwColor = Color.lerp(new Color(), c0, c2, ccwScalar); // Add vertex property

            topHull.colors.push(cwColor);
            topHull.colors.push(ccwColor);
            bottomHull.colors.push(cwColor);
            bottomHull.colors.push(ccwColor);
            cwColorIntersection == null ? void 0 : cwColorIntersection.set(cwColor);
            ccwColorIntersection == null ? void 0 : ccwColorIntersection.set(ccwColor);
          } // Interpolate tangents


          if (this.tangents && this.tangents.length >= 3) {
            var t0 = this.tangents[top];
            var t1 = this.tangents[cw];
            var t2 = this.tangents[ccw];
            var cwTangent = new Vec4();
            cwTangent.x = t0.x + (t1.x - t0.x) * cwScalar;
            cwTangent.y = t0.y + (t1.y - t0.y) * cwScalar;
            cwTangent.z = t0.z + (t1.z - t0.z) * cwScalar;
            cwTangent.normalize();
            cwTangent.w = t1.w;
            var ccwTangent = new Vec4();
            ccwTangent.x = t0.x + (t2.x - t0.x) * ccwScalar;
            ccwTangent.y = t0.y + (t2.y - t0.y) * ccwScalar;
            ccwTangent.z = t0.z + (t2.z - t0.z) * ccwScalar;
            ccwTangent.normalize();
            ccwTangent.w = t2.w; // Add vertex property

            topHull.tangents.push(cwTangent);
            topHull.tangents.push(ccwTangent);
            bottomHull.tangents.push(cwTangent);
            bottomHull.tangents.push(ccwTangent);
          } // Interpolate uvs


          if (this.uvs) {
            var u0 = this.uvs[top];
            var u1 = this.uvs[cw];
            var u2 = this.uvs[ccw];
            var cwUv = new Vec2();
            cwUv.x = u0.x + (u1.x - u0.x) * cwScalar;
            cwUv.y = u0.y + (u1.y - u0.y) * cwScalar;
            var ccwUv = new Vec2();
            ccwUv.x = u0.x + (u2.x - u0.x) * ccwScalar;
            ccwUv.y = u0.y + (u2.y - u0.y) * ccwScalar; // Add vertex property

            topHull.uvs.push(cwUv);
            topHull.uvs.push(ccwUv);
            bottomHull.uvs.push(cwUv);
            bottomHull.uvs.push(ccwUv);
          } // Set output


          cwIntersection.set(cwVertex);
          ccwIntersection.set(ccwVertex);
        }

        FastFillCutEdges(a, b, edges, pos, normal, colors) {
          if (edges.length < 3) {
            console.log("edges point less 3! cut fail");
            return false;
          }

          for (var i = 0; i < edges.length - 3; i++) {
            var t = edges[i + 1];
            var temp = edges[i + 3];

            for (var j = i + 2; j < edges.length - 1; j += 2) {
              if (Vec3.subtract(tempVec3, edges[j], t).lengthSqr() < 1e-6) {
                edges[j] = edges[i + 2];
                edges[i + 3] = edges[j + 1];
                edges[j + 1] = temp;
                break;
              }

              if (Vec3.subtract(tempVec3, edges[j + 1], t).lengthSqr() < 1e-6) {
                edges[j + 1] = edges[i + 2];
                edges[i + 3] = edges[j];
                edges[j] = temp;
                break;
              }
            }

            edges.splice(i + 2, 1);
            if (this.colors) colors == null ? void 0 : colors.splice(i + 2, 1);
          }

          edges.splice(edges.length - 1, 1);
          if (this.colors) colors == null ? void 0 : colors.splice(edges.length - 1, 1);
          var offsetA = a.vertices.length;
          var offsetB = b.vertices.length;
          a.vertices.push(...edges);
          b.vertices.push(...edges);

          if (this.colors) {
            a.colors.push(...colors);
            b.colors.push(...colors);
          }

          if (this.normals) {
            var normalA = Vec3.negate(new Vec3(), normal);
            var normalB = normal;
            var tangentA = this.CalculateTangent(normalA);
            var tangentB = this.CalculateTangent(normalB);

            for (var _i = 0; _i < edges.length; _i++) {
              a.normals.push(normalA);
              b.normals.push(normalB);
            }

            if (this.tangents) {
              for (var _i3 = 0; _i3 < edges.length; _i3++) {
                a.tangents.push(tangentA);
                b.tangents.push(tangentB);
              }
            }
          }

          var indicesA = [];
          var indicesB = [];

          for (var _i4 = 1, count = edges.length - 1; _i4 < count; _i4++) {
            indicesA.push(offsetA + 0);
            indicesA.push(offsetA + _i4 + 1);
            indicesA.push(offsetA + _i4);
            indicesB.push(offsetB + 0);
            indicesB.push(offsetB + _i4);
            indicesB.push(offsetB + _i4 + 1);
          }

          a.indices.push(...indicesA);
          b.indices.push(...indicesB);

          if (this.uvs) {
            var uvsa = this.uvMap(indicesA, edges, offsetA);
            a.uvs.push(...uvsa);
            var uvsb = this.uvMap(indicesB, edges, offsetB);
            b.uvs.push(...uvsb);
          } // return cutEdges;


          return true;
        }

        CalculateTangent(normal) {
          var tan = Vec3.cross(tempVec3, normal, Vec3.UP);
          if (tan == Vec3.ZERO) tan = Vec3.cross(tempVec3, normal, Vec3.FORWARD);
          tan = Vec3.cross(tempVec3, tan, normal);
          return new Vec4(tan.x, tan.y, tan.z, 1);
        }

        uvMap(indices, vertices, offset) {
          // console.log(indices);
          // console.log(vertices);
          // console.log(offset);
          var uvs = [];
          var count = indices.length / 3;
          var uvRangeMin = new Vec2(0, 0);
          var uvRangeMax = new Vec2(1, 1);

          for (var i = 0; i < count; i++) {
            var _i0 = indices[i * 3] - offset;

            var _i1 = indices[i * 3 + 1] - offset;

            var _i2 = indices[i * 3 + 2] - offset;

            var v0 = Vec3.subtract(tempVec3, vertices[_i0], this.center).add(this.size).multiplyScalar(1 / 2);
            v0 = Vec3.divide(new Vec3(), v0, this.size);
            var v1 = Vec3.subtract(tempVec3, vertices[_i1], this.center).add(this.size).multiplyScalar(1 / 2);
            v1 = Vec3.divide(new Vec3(), v1, this.size);
            var v2 = Vec3.subtract(tempVec3, vertices[_i2], this.center).add(this.size).multiplyScalar(1 / 2);
            v2 = Vec3.divide(new Vec3(), v2, this.size);
            var a = Vec3.subtract(new Vec3(), v0, v1);
            var b = Vec3.subtract(new Vec3(), v2, v1);
            var dir = Vec3.cross(new Vec3(), a, b);
            var x = Math.abs(Vec3.dot(dir, Vec3.RIGHT));
            var y = Math.abs(Vec3.dot(dir, Vec3.UP));
            var z = Math.abs(Vec3.dot(dir, Vec3.FORWARD));

            if (x >= y && x >= z) {
              uvs[_i0] = new Vec2(v0.z, v0.y);
              uvs[_i1] = new Vec2(v1.z, v1.y);
              uvs[_i2] = new Vec2(v2.z, v2.y);
            } else if (y >= x && y >= z) {
              uvs[_i0] = new Vec2(v0.x, v0.z);
              uvs[_i1] = new Vec2(v1.x, v1.z);
              uvs[_i2] = new Vec2(v2.x, v2.z);
            } else if (z >= x && z >= y) {
              uvs[_i0] = new Vec2(v0.x, v0.y);
              uvs[_i1] = new Vec2(v1.x, v1.y);
              uvs[_i2] = new Vec2(v2.x, v2.y);
            }

            uvs[_i0] = new Vec2(uvRangeMin.x + (uvRangeMax.x - uvRangeMin.x) * uvs[_i0].x, uvRangeMin.y + (uvRangeMax.y - uvRangeMin.y) * uvs[_i0].y);
            uvs[_i1] = new Vec2(uvRangeMin.x + (uvRangeMax.x - uvRangeMin.x) * uvs[_i1].x, uvRangeMin.y + (uvRangeMax.y - uvRangeMin.y) * uvs[_i1].y);
            uvs[_i2] = new Vec2(uvRangeMin.x + (uvRangeMax.x - uvRangeMin.x) * uvs[_i2].x, uvRangeMin.y + (uvRangeMax.y - uvRangeMin.y) * uvs[_i2].y);
          }

          return uvs;
        }

        ValidateOutput(a, b, planeNormal) {
          var lengthA = a.LengthAlongAxis(planeNormal);
          var lengthB = b.LengthAlongAxis(planeNormal);
          var sum = lengthA + lengthB;

          if (sum < FastHull.smallestValidLength) {
            a.isValid = false;
            b.isValid = false;
          } else if (lengthA / sum < FastHull.smallestValidRatio) {
            a.isValid = false;
          } else if (lengthB / sum < FastHull.smallestValidRatio) {
            b.isValid = false;
          }
        }

        LengthAlongAxis(axis) {
          if (this.vertices.length > 0) {
            var min = this.vertices[0].dot(axis);
            var max = min;
            this.vertices.forEach(vertex => {
              var distance = vertex.dot(axis);
              min = Math.min(distance, min);
              max = Math.max(distance, max);
            });
            return max - min;
          }

          return 0;
        }

      });

      FastHull.smallestValidLength = 0.01;
      FastHull.smallestValidRatio = 0.05;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=39b987c9beadc750b89519ad1a30ca7ef70a4c24.js.map