
core.rails.test.mplay();
assert( Mplay );
assert( "mplays" == Mplay.getCollectionName() );
assert( (new Mplay()).getCollectionName() == Mplay.getCollectionName() );
assert( Mplay.getSingularName() + "s" == Mplay.getCollectionName() );

