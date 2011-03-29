#!/usr/bin/env python
# coding=utf8

from functools import wraps
import re
import socket

from flask import Flask, request, make_response

app = Flask(__name__)

login_port = 63800 # hardcoded for security


def allow_origins(origins):
	def wrap_func(f):
		@wraps(f)
		def w(*args, **kwargs):
			resp = make_response(f(*args, **kwargs))
			if '*' in origins:
				resp.headers['Access-Control-Allow-Origin'] = '*'
			elif 'ORIGIN' in request.headers and request.headers['ORIGIN'] in origins:
				resp.headers['Access-Control-Allow-Origin'] = request.headers['ORIGIN']
			return resp
		return w

	return wrap_func

@app.route('/gomlogin/<server_ip>/')
@allow_origins(['http://gomtv.net', 'http://www.gomtv.net', 'https://gomtv.net', 'https://www.gomtv.net'])
def perform_login(server_ip):
	login_str = 'Login,0,%(uno)s,%(nodeid)s,%(userip)s\n' % request.args

	s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
	s.connect( (server_ip, login_port) )

	print 'using login string',login_str
	s.sendall(login_str)

	buf = ''
	while True:
		c = s.recv(1)
		if '\n' == c: break
		buf += c

	return buf

if '__main__' == __name__:
	app.run(use_debugger = True, use_reloader = True, debug = True)
