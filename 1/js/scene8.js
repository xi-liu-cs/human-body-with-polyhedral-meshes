rooms.scene = function() {

lib3d();

description =
`<b>scene</b>
<p>hierarchic 3d scene<br>
with triangle meshes<p>
<input type = range id = move_rate> rate<br>
<input type = range id = arm_len value = 28> arm length<br>
<input type = range id = leg_len value = 40> leg length<br>
<input type = range id = finger_number value = 5> finger number<br>
<input type = range id = toe_number value = 5> toe number<br>`;

code = {
'init':
line(26) +
`S.square_mesh =
[-1,1,0, 0,0,1, 0,1,
1,1,0, 0,0,1, 1,1,
-1,-1,0, 0,0,1, 0,0,
1,-1,0, 0,0,1, 1,0];

let face0 = transform_mesh(S.square_mesh, matrixTranslate([0, 0, 1])),
face1 = transform_mesh(face0, matrixRotx(Math.PI / 2)),
face2 = transform_mesh(face0, matrixRotx(Math.PI)),
face3 = transform_mesh(face0, matrixRotx(-Math.PI / 2)),
face4 = transform_mesh(face0, matrixRoty(-Math.PI / 2)),
face5 = transform_mesh(face0, matrixRoty(Math.PI / 2));

S.cube_mesh = 
glue_mesh(face0,
glue_mesh(face1,
glue_mesh(face2,
glue_mesh(face3,
glue_mesh(face4, face5)))));

S.draw_mesh =
function(mesh, matrix)
{
    let gl = S.gl;
    S.setUniform('Matrix4fv', 'uMatrix', false, matrix);
    S.setUniform('Matrix4fv', 'uInvMatrix', false, matrixInverse(matrix));
    S.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh), gl.STATIC_DRAW);
    S.gl.drawArrays(S.gl.TRIANGLE_STRIP, 0, mesh.length / S.VERTEX_SIZE);
}
`,
fragment: `
S.setFragmentShader(\`
varying vec3 vPos, vNor;
void main()
{
    float c = .2 + .8 * max(0., dot(vNor, vec3(.57)));
    gl_FragColor = vec4(c, c, c, 1.);
}
\`);
`,
vertex: `
S.setVertexShader(\`
attribute vec3 aPos, aNor;
varying vec3 vPos, vNor;
uniform mat4 uMatrix, uInvMatrix, uProject;

void main()
{
    vec4 pos = uProject * uMatrix * vec4(aPos, 1.);
    vec4 nor = vec4(aNor, 0.) * uInvMatrix;
    vPos = pos.xyz;
    vNor = normalize(nor.xyz);
    gl_Position = pos * vec4(1.,1.,-.01,1.);
}
\`)
`,
render: `
S.setUniform('Matrix4fv', 'uProject', false,
[1,0,0,0, 0,1,0,0, 0,0,1,-.2, 0,0,0,1]);

let rate = 2 * time * move_rate.value / 100,
arm_length = .1 + .9 * arm_len.value / 100,
leg_length = .1 + .9 * leg_len.value / 100,
n_finger = finger_number.value,
n_toe = toe_number.value;

let m = new matrix();
m.identity();
m.roty(Math.sin(.5 * rate));
m.save();
    m.save(); /* head */
        m.translate(0, .73, 0);
        m.rotz(.3 * Math.cos(2 * time));
        m.save();
            m.translate(0, .12, 0);
            m.scale(.1, .12, .1);
            S.draw_mesh(S.sphere_mesh, m.get());
        m.restore();
    m.restore();

    for(let i = -1; i <= 1; i += 2)
    {/* arm */
        let t = rate + i * Math.PI / 2;
        m.save();
            m.translate(i * .2, .6 + .03 * Math.cos(t), 0);
            m.rotx(Math.cos(t));
            m.save();
                m.translate(0, -arm_length / 2, 0);
                m.scale(.035, arm_length / 2, .035);
                S.draw_mesh(S.sphere_mesh, m.get());
            m.restore();
            m.translate(0, -arm_length, 0);
            m.rotx(-1 + .7 * Math.sin(t));
            m.save();
                m.translate(0, -arm_length / 2, 0);
                m.scale(.035, arm_length / 2, .035);
                S.draw_mesh(S.sphere_mesh, m.get());
            m.restore();
            m.translate(0, -arm_length, 0);
            m.rotx(-1 + .7 * Math.sin(t));
            m.save(); /* hand */
                m.translate(0, -arm_length / 10, -.03);
                m.scale(.01, arm_length / 10, .02);
                S.draw_mesh(S.cube_mesh, m.get());
            m.restore();
            for(let j = 0; j < n_finger; ++j)
            {/* finger */
                m.save();
                    m.rotx(j / Math.PI);
                    m.translate(0, -arm_length / 5, 0);
                    m.scale(.01, arm_length / 5, .01);
                    S.draw_mesh(S.sphere_mesh, m.get());
                m.restore();
            }
        m.restore();
    }

    for(let i = -1; i <= 1; i += 2)
    {/* leg */
        let t = rate - i * Math.PI / 2;
        m.save();
            m.translate(i * .1, .1 + .03 * Math.cos(t), 0);
            m.rotx(Math.cos(t));
            m.save();
                m.translate(0, -leg_length / 2, 0);
                m.scale(.05, leg_length / 2, .05);
                S.draw_mesh(S.sphere_mesh, m.get());
            m.restore();
            m.translate(0, -leg_length, 0);
            m.rotx(1 + Math.sin(t));
            m.save();
                m.translate(0, -leg_length / 2, 0);
                m.scale(.05, leg_length / 2, .05);
                S.draw_mesh(S.sphere_mesh, m.get());
            m.restore();
            m.translate(0, -leg_length, 0);
            m.rotx(-Math.PI);
            m.roty(Math.PI / 2);
            m.rotz(Math.PI / 2);
            m.save(); /* foot */
                m.translate(0, -arm_length / 6, 0);
                m.scale(.01, arm_length / 6, .02);
                S.draw_mesh(S.cube_mesh, m.get());
            m.restore();
            m.rotx(-Math.PI / 10);
            for(let j = 0; j < n_toe; ++j)
            {/* toe */
                m.save();
                    m.rotx(j / Math.PI / 2.3);
                    m.translate(0, -arm_length / 5, 0);
                    m.scale(.01, arm_length / 5, .01);
                    S.draw_mesh(S.sphere_mesh, m.get());
                m.restore();
            }
        m.restore();
    }
m.restore();

/* body */
m.save();
    m.save();
        m.translate(0, .32, 0);
        m.scale(.14, .39, .14);
        m.rotx(Math.PI / 2);
        S.draw_mesh(S.sphere_mesh, m.get());
    m.restore();
    m.translate(0, .35, 0);
    m.scale(.12, .39, .12);
    m.rotx(Math.PI / 2);
    m.save();
        m.scale(1, 1, .8);
        m.translate(0, .1, 0);
        S.draw_mesh(S.tube_mesh, m.get());
    m.restore();
m.restore();

/* neck */
m.save();
m.translate(0, .7, 0);
m.scale(.06, .05, .06);
m.rotx(Math.PI / 2);
S.draw_mesh(S.tube_mesh, m.get());
m.restore();

/* back */
let m2 = new matrix();
m2.identity();
m2.save();
m2.scale(100, 100, 100);
m2.translate(-.2, .1, -100);
S.draw_mesh(S.rectangle_mesh, m2.get());
m2.restore();
`,
events: `
    ;
`
};

}    