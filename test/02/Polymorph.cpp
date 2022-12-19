#include "Polymorph.hpp"

Polymorph::Polymorph(void) : ASpell("Polymorph", "fwooshed")
{

}

Polymorph::~Polymorph(void)
{

}

ASpell *Polymorph::clone(void) const
{
    return (new Polymorph());
}