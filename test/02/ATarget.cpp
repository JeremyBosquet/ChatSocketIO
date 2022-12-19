#include "ATarget.hpp"

ATarget::ATarget(void)
{
}

ATarget::ATarget(ATarget const &other)
{
    *this = other;
}

ATarget::ATarget(std::string const &type)
{
    this->type = type;
}

ATarget &ATarget::operator=(ATarget const &other)
{
    this->type = other.getType();
    return (*this);
}

ATarget::~ATarget()
{
}

std::string const &ATarget::getType(void) const
{
    return (this->type);
}

void ATarget::getHitBySpell(ASpell const &other) const
{
    std::cout << this->getType() << " has been " << other.getEffects() << "!\n";
}

