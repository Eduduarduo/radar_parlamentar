# Create your views here.
# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from modelagem import models
from django.http import HttpResponseRedirect, HttpResponse
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, get_object_or_404, get_list_or_404, redirect

def index(request):
    return render_to_response('index.html', {}, context_instance=RequestContext(request))

def origem(request):
    return render_to_response('origem.html', {}, context_instance=RequestContext(request))

def ogrupo(request):
    return render_to_response('grupo.html', {}, context_instance=RequestContext(request))

def premiacoes(request):
    return render_to_response('premiacoes.html', {}, context_instance=RequestContext(request))

def votoaberto(request):
    return render_to_response('votoaberto.html', {}, context_instance=RequestContext(request))

def importadores(request):
    return render_to_response('importadores.html', {}, context_instance=RequestContext(request))

def grafico_alternativo(request):
    return render_to_response('grafico_alternativo.html', {}, context_instance=RequestContext(request))

def genero_termos(request):
    return render_to_response('genero_termos.html', {}, context_instance=RequestContext(request))

def genero_matriz(request):
    return render_to_response('genero_matriz.html', {}, context_instance=RequestContext(request))

def genero_historia(request):
    return render_to_response('genero_historia.html', {}, context_instance=RequestContext(request))

def genero_perfil_legis(request):
    return render_to_response('perfil_legis.html', {}, context_instance=RequestContext(request))

